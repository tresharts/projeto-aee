package com.art.aee.atendimento;

import com.art.aee.aluno.Aluno;
import com.art.aee.aluno.AlunoRepository;
import com.art.aee.atendimento.dto.AtendimentoRequest;
import com.art.aee.atendimento.dto.AtendimentoResponse;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.RecursoNaoEncontradoException;
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

    public AtendimentoService(AtendimentoRepository atendimentoRepository,
                              AlunoRepository alunoRepository,
                              TurmaRepository turmaRepository,
                              AtendimentoMapper atendimentoMapper) {
        this.atendimentoRepository = atendimentoRepository;
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
        this.atendimentoMapper = atendimentoMapper;
    }

    @Transactional
    public AtendimentoResponse criar(AtendimentoRequest request, UUID professorId, UUID escolaId) {
        validarAlunoDaEscola(request.alunoId(), escolaId);
        Atendimento atendimento = new Atendimento();
        atendimentoMapper.copiarDados(request, atendimento);
        atendimento.setProfessorId(professorId);
        return atendimentoMapper.paraResponse(atendimentoRepository.saveAndFlush(atendimento));
    }

    @Transactional
    public AtendimentoResponse atualizar(UUID id, AtendimentoRequest request, UUID professorId, UUID escolaId) {
        Atendimento atendimento = buscarEntidade(id, escolaId);
        validarAlunoDaEscola(request.alunoId(), escolaId);
        atendimentoMapper.copiarDados(request, atendimento);
        atendimento.setProfessorId(professorId);
        return atendimentoMapper.paraResponse(atendimentoRepository.save(atendimento));
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
}
