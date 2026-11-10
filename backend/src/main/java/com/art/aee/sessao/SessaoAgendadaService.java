package com.art.aee.sessao;

import com.art.aee.aluno.Aluno;
import com.art.aee.aluno.AlunoRepository;
import com.art.aee.atendimento.AtendimentoRepository;
import com.art.aee.atendimento.Atendimento;
import com.art.aee.escola.Escola;
import com.art.aee.escola.EscolaRepository;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.RecursoNaoEncontradoException;
import com.art.aee.professor.Professor;
import com.art.aee.sessao.dto.FaltaConsecutivaResponse;
import com.art.aee.sessao.dto.SessaoRequest;
import com.art.aee.sessao.dto.SessaoResponse;
import com.art.aee.turma.Turma;
import com.art.aee.turma.TurmaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class SessaoAgendadaService {

    private final SessaoAgendadaRepository sessaoRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;
    private final EscolaRepository escolaRepository;
    private final AtendimentoRepository atendimentoRepository;

    public SessaoAgendadaService(
            SessaoAgendadaRepository sessaoRepository,
            AlunoRepository alunoRepository,
            TurmaRepository turmaRepository,
            EscolaRepository escolaRepository,
            AtendimentoRepository atendimentoRepository) {
        this.sessaoRepository = sessaoRepository;
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
        this.escolaRepository = escolaRepository;
        this.atendimentoRepository = atendimentoRepository;
    }

    @Transactional(readOnly = true)
    public List<SessaoResponse> listar(LocalDate inicio, LocalDate fim, Professor professor) {
        validarEscola(professor);
        if (inicio == null || fim == null) throw new IllegalArgumentException("Informe o início e o fim do período.");
        if (fim.isBefore(inicio)) throw new IllegalArgumentException("O fim do período deve ser posterior ao início.");
        if (fim.isAfter(inicio.plusDays(41))) throw new IllegalArgumentException("Consulte no máximo seis semanas por vez.");

        return sessaoRepository.findByProfessorIdAndDataHoraGreaterThanEqualAndDataHoraLessThanOrderByDataHoraAsc(
                        professor.getId(), inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay())
                .stream().map(this::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<FaltaConsecutivaResponse> listarAlertasDeFaltas(Professor professor) {
        validarEscola(professor);
        List<UUID> turmaIds = turmaRepository.findByEscolaId(professor.getEscolaId()).stream()
                .map(Turma::getId).toList();
        if (turmaIds.isEmpty()) return List.of();

        List<Aluno> alunosAtivos = alunoRepository.findByTurmaIdIn(turmaIds, PageRequest.of(0, 5000)).getContent()
                .stream().filter(Aluno::isAtivo).toList();
        List<UUID> alunoIds = alunosAtivos.stream().map(Aluno::getId).toList();
        if (alunoIds.isEmpty()) return List.of();

        Map<UUID, Aluno> alunosPorId = new HashMap<>();
        alunosAtivos.forEach(aluno -> alunosPorId.put(aluno.getId(), aluno));
        Map<UUID, Integer> faltasConsecutivas = new HashMap<>();
        Set<UUID> sequenciaEncerrada = new HashSet<>();
        List<Atendimento> atendimentosRecentes = atendimentoRepository.findByAlunoIdIn(
                alunoIds, PageRequest.of(0, 5000, Sort.by(Sort.Direction.DESC, "dataHora"))).getContent();

        for (Atendimento atendimento : atendimentosRecentes) {
            UUID alunoId = atendimento.getAlunoId();
            if (sequenciaEncerrada.contains(alunoId)) continue;
            if (Boolean.FALSE.equals(atendimento.getPresente())) {
                faltasConsecutivas.merge(alunoId, 1, Integer::sum);
            } else {
                sequenciaEncerrada.add(alunoId);
            }
        }

        return faltasConsecutivas.entrySet().stream()
                .filter(entry -> entry.getValue() >= 3)
                .map(entry -> new FaltaConsecutivaResponse(entry.getKey(), alunosPorId.get(entry.getKey()).getNome(), entry.getValue()))
                .sorted((a, b) -> Integer.compare(b.quantidade(), a.quantidade()))
                .toList();
    }

    @Transactional
    public SessaoResponse criar(SessaoRequest request, Professor professor) {
        validarEscola(professor);
        Aluno aluno = validarAluno(request.alunoId(), professor);
        validarConflito(request.dataHora(), professor.getId(), null);

        SessaoAgendada sessao = new SessaoAgendada();
        sessao.setAlunoId(aluno.getId());
        sessao.setProfessorId(professor.getId());
        sessao.setDataHora(request.dataHora());
        sessao.setObservacao(normalizarObservacao(request.observacao()));
        return paraResponse(sessaoRepository.save(sessao));
    }

    @Transactional
    public SessaoResponse atualizar(UUID id, SessaoRequest request, Professor professor) {
        SessaoAgendada sessao = buscar(id, professor);
        if (sessao.getStatus() != SessaoStatus.AGENDADA) {
            throw new ConflitoException("Somente sessões agendadas podem ser alteradas.");
        }
        Aluno aluno = validarAluno(request.alunoId(), professor);
        validarConflito(request.dataHora(), professor.getId(), sessao.getId());
        sessao.setAlunoId(aluno.getId());
        sessao.setDataHora(request.dataHora());
        sessao.setObservacao(normalizarObservacao(request.observacao()));
        return paraResponse(sessaoRepository.save(sessao));
    }

    @Transactional
    public SessaoResponse atualizarStatus(UUID id, SessaoStatus novoStatus, Professor professor) {
        SessaoAgendada sessao = buscar(id, professor);
        if (sessao.getStatus() != SessaoStatus.AGENDADA) {
            throw new ConflitoException("Esta sessão já foi finalizada.");
        }
        if (novoStatus == SessaoStatus.REALIZADA) {
            throw new ConflitoException("Vincule o registro do atendimento para concluir a sessão.");
        }
        if (novoStatus == SessaoStatus.FALTA) {
            if (sessao.getDataHora().isAfter(LocalDateTime.now())) {
                throw new ConflitoException("Não é possível registrar falta antes do horário da sessão.");
            }
            Atendimento falta = new Atendimento();
            falta.setAlunoId(sessao.getAlunoId());
            falta.setProfessorId(professor.getId());
            falta.setDataHora(sessao.getDataHora());
            falta.setPresente(false);
            falta.setObservacoes("Falta registrada a partir da sessão agendada.");
            sessao.setAtendimentoId(atendimentoRepository.saveAndFlush(falta).getId());
        } else if (novoStatus != SessaoStatus.CANCELADA) {
            throw new IllegalArgumentException("Status de sessão inválido.");
        }
        sessao.setStatus(novoStatus);
        return paraResponse(sessaoRepository.save(sessao));
    }

    @Transactional
    public SessaoResponse vincularAtendimento(UUID id, UUID atendimentoId, Professor professor) {
        SessaoAgendada sessao = buscar(id, professor);
        Atendimento atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atendimento não encontrado."));
        if (!atendimento.getAlunoId().equals(sessao.getAlunoId())
                || !professor.getId().equals(atendimento.getProfessorId())
                || !Boolean.TRUE.equals(atendimento.getPresente())) {
            throw new RecursoNaoEncontradoException("Atendimento não encontrado para esta sessão.");
        }
        if (sessao.getStatus() != SessaoStatus.AGENDADA) {
            throw new ConflitoException("Somente sessões agendadas podem receber um atendimento.");
        }
        sessao.setAtendimentoId(atendimento.getId());
        sessao.setStatus(SessaoStatus.REALIZADA);
        return paraResponse(sessaoRepository.save(sessao));
    }

    private SessaoAgendada buscar(UUID id, Professor professor) {
        validarEscola(professor);
        return sessaoRepository.findByIdAndProfessorId(id, professor.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sessão não encontrada."));
    }

    private Aluno validarAluno(UUID alunoId, Professor professor) {
        Aluno aluno = alunoRepository.findByIdAndAtivoTrue(alunoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno ativo não encontrado."));
        if (!turmaRepository.existsByIdAndEscolaId(aluno.getTurmaId(), professor.getEscolaId())) {
            throw new RecursoNaoEncontradoException("Aluno não encontrado.");
        }
        return aluno;
    }

    private void validarConflito(LocalDateTime dataHora, UUID professorId, UUID sessaoId) {
        boolean conflito = sessaoId == null
                ? sessaoRepository.existsByProfessorIdAndDataHoraAndStatusNot(professorId, dataHora, SessaoStatus.CANCELADA)
                : sessaoRepository.existsByProfessorIdAndDataHoraAndStatusNotAndIdNot(
                        professorId, dataHora, SessaoStatus.CANCELADA, sessaoId);
        if (conflito) throw new ConflitoException("Já existe uma sessão neste horário.");
    }

    private void validarEscola(Professor professor) {
        if (professor.getEscolaId() == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
    }

    private String normalizarObservacao(String observacao) {
        if (observacao == null || observacao.isBlank()) return null;
        String texto = observacao.trim();
        if (texto.length() > 1000) throw new IllegalArgumentException("A observação não pode ultrapassar 1000 caracteres.");
        return texto;
    }

    private SessaoResponse paraResponse(SessaoAgendada sessao) {
        Aluno aluno = alunoRepository.findById(sessao.getAlunoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
        Turma turma = turmaRepository.findById(aluno.getTurmaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Turma não encontrada."));
        Escola escola = escolaRepository.findById(turma.getEscolaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Escola não encontrada."));
        return new SessaoResponse(sessao.getId(), aluno.getId(), aluno.getNome(), turma.getNome(), escola.getNome(),
                sessao.getDataHora(), sessao.getStatus(), sessao.getObservacao(), sessao.getAtendimentoId());
    }
}
