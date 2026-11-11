package com.art.aee.atendimento;

import com.art.aee.aluno.Aluno;
import com.art.aee.aluno.AlunoRepository;
import com.art.aee.atendimento.dto.AtendimentoRequest;
import com.art.aee.atendimento.dto.AtendimentoResponse;
import com.art.aee.atendimento.dto.AtendimentoObjetivoRequest;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.RecursoNaoEncontradoException;
import com.art.aee.pei.ObjetivoPei;
import com.art.aee.pei.ObjetivoPeiRepository;
import com.art.aee.turma.TurmaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AtendimentoService {

    private final AtendimentoRepository atendimentoRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;
    private final AtendimentoMapper atendimentoMapper;
    private final AtendimentoObjetivoPeiRepository atendimentoObjetivoPeiRepository;
    private final ObjetivoPeiRepository objetivoPeiRepository;

    public AtendimentoService(AtendimentoRepository atendimentoRepository,
                              AlunoRepository alunoRepository,
                              TurmaRepository turmaRepository,
                              AtendimentoMapper atendimentoMapper,
                              AtendimentoObjetivoPeiRepository atendimentoObjetivoPeiRepository,
                              ObjetivoPeiRepository objetivoPeiRepository) {
        this.atendimentoRepository = atendimentoRepository;
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
        this.atendimentoMapper = atendimentoMapper;
        this.atendimentoObjetivoPeiRepository = atendimentoObjetivoPeiRepository;
        this.objetivoPeiRepository = objetivoPeiRepository;
    }

    @Transactional
    public AtendimentoResponse criar(AtendimentoRequest request, UUID professorId, UUID escolaId) {
        validarAlunoDaEscola(request.alunoId(), escolaId);
        Atendimento atendimento = new Atendimento();
        atendimentoMapper.copiarDados(request, atendimento);
        validarCamposObrigatorios(atendimento);
        atendimento.setProfessorId(professorId);
        Atendimento salvo = atendimentoRepository.saveAndFlush(atendimento);
        salvarObjetivosPei(salvo, request.objetivosPei());
        return atendimentoMapper.paraResponse(salvo);
    }

    @Transactional
    public AtendimentoResponse atualizar(UUID id, AtendimentoRequest request, UUID professorId, UUID escolaId) {
        Atendimento atendimento = buscarEntidade(id, escolaId);
        validarAlunoDaEscola(request.alunoId(), escolaId);
        atendimentoMapper.copiarDados(request, atendimento);
        validarCamposAtualizacao(request, atendimento);
        atendimento.setProfessorId(professorId);
        Atendimento salvo = atendimentoRepository.save(atendimento);
        salvarObjetivosPei(salvo, request.objetivosPei());
        return atendimentoMapper.paraResponse(salvo);
    }

    @Transactional(readOnly = true)
    public AtendimentoResponse buscarPorId(UUID id, UUID escolaId) {
        return atendimentoMapper.paraResponse(buscarEntidade(id, escolaId));
    }

    @Transactional(readOnly = true)
    public Page<AtendimentoResponse> listar(Pageable pageable, UUID alunoId, LocalDateTime inicio,
                                             LocalDateTime fim, UUID escolaId) {
        if (escolaId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");

        List<UUID> turmaIds = turmaRepository.findByEscolaId(escolaId).stream()
                .map(turma -> turma.getId()).toList();
        if (turmaIds.isEmpty()) return Page.empty(pageable);
        List<UUID> alunoIds = alunoRepository.findIdsByTurmaIdIn(turmaIds);
        if (alunoIds.isEmpty()) return Page.empty(pageable);

        if (alunoId != null) {
            if (!alunoIds.contains(alunoId)) throw new RecursoNaoEncontradoException("Aluno não encontrado");
            alunoIds = List.of(alunoId);
        }

        Page<Atendimento> page;
        if (inicio != null && fim != null) {
            page = atendimentoRepository.findByAlunoIdInAndDataHoraBetween(alunoIds, inicio, fim, pageable);
        } else if (inicio != null) {
            page = atendimentoRepository.findByAlunoIdInAndDataHoraGreaterThanEqual(alunoIds, inicio, pageable);
        } else if (fim != null) {
            page = atendimentoRepository.findByAlunoIdInAndDataHoraLessThanEqual(alunoIds, fim, pageable);
        } else {
            page = atendimentoRepository.findByAlunoIdIn(alunoIds, pageable);
        }
        return page.map(atendimentoMapper::paraResponse);
    }

    private Atendimento buscarEntidade(UUID id, UUID escolaId) {
        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atendimento não encontrado"));
        validarAlunoDaEscola(atendimento.getAlunoId(), escolaId);
        return atendimento;
    }

    private void validarAlunoDaEscola(UUID alunoId, UUID escolaId) {
        if (escolaId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado"));
        if (!turmaRepository.existsByIdAndEscolaId(aluno.getTurmaId(), escolaId)) {
            throw new RecursoNaoEncontradoException("Aluno não encontrado");
        }
    }

    private void salvarObjetivosPei(Atendimento atendimento, List<AtendimentoObjetivoRequest> requests) {
        if (requests == null) return;

        List<UUID> ids = requests.stream().map(AtendimentoObjetivoRequest::objetivoPeiId).toList();
        if (ids.stream().distinct().count() != ids.size()) {
            throw new IllegalArgumentException("O mesmo objetivo do PEI não pode ser repetido no atendimento.");
        }

        List<ObjetivoPei> objetivos = ids.isEmpty()
                ? List.of()
                : objetivoPeiRepository.findByIdInAndAlunoIdAndAtivoTrue(ids, atendimento.getAlunoId());
        if (objetivos.size() != ids.size()) {
            throw new RecursoNaoEncontradoException("Um ou mais objetivos ativos do PEI não foram encontrados para este aluno.");
        }

        atendimentoObjetivoPeiRepository.deleteByAtendimentoId(atendimento.getId());
        var vinculos = requests.stream().map(request -> {
            ObjetivoPei objetivo = objetivos.stream()
                    .filter(item -> item.getId().equals(request.objetivoPeiId()))
                    .findFirst()
                    .orElseThrow();
            AtendimentoObjetivoPei vinculo = new AtendimentoObjetivoPei();
            vinculo.setAtendimentoId(atendimento.getId());
            vinculo.setObjetivoPeiId(objetivo.getId());
            vinculo.setDescricaoObjetivo(objetivo.getDescricao());
            vinculo.setNivel(request.nivel());
            vinculo.setObservacao(request.observacao());
            return vinculo;
        }).toList();
        atendimentoObjetivoPeiRepository.saveAll(vinculos);
    }

    private void validarCamposObrigatorios(Atendimento atendimento) {
        if (atendimento.getHumor() == null) throw new IllegalArgumentException("Humor é obrigatório.");
        if (atendimento.getHumor() == Humor.OUTRO &&
                (atendimento.getHumorOutro() == null || atendimento.getHumorOutro().isBlank())) {
            throw new IllegalArgumentException("Descreva o humor selecionado como Outro.");
        }
        if (atendimento.getParticipacao() == null) throw new IllegalArgumentException("Participação é obrigatória.");
        if (atendimento.getDesenvolvimento() == null) throw new IllegalArgumentException("Desenvolvimento é obrigatório.");

    }

    private void validarCamposAtualizacao(AtendimentoRequest request, Atendimento atendimento) {
        if (atendimento.getHumor() == Humor.OUTRO &&
                (atendimento.getHumorOutro() == null || atendimento.getHumorOutro().isBlank())) {
            throw new IllegalArgumentException("Descreva o humor selecionado como Outro.");
        }
    }
}
