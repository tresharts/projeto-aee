package com.art.aee.aluno;

import com.art.aee.aluno.dto.AlunoRequest;
import com.art.aee.aluno.dto.AlunoResponse;
import com.art.aee.turma.TurmaRepository;
import com.art.aee.exception.RecursoNaoEncontradoException;
import com.art.aee.exception.ConflitoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;
    private final AlunoMapper alunoMapper;

    public AlunoService(
            AlunoRepository alunoRepository,
            TurmaRepository turmaRepository,
            AlunoMapper alunoMapper) {
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
        this.alunoMapper = alunoMapper;
    }

    @Transactional
    public AlunoResponse criar(AlunoRequest request, UUID escolaUsuarioId) {
        validarTurma(request.turmaId(), escolaUsuarioId);

        Aluno aluno = new Aluno();
        alunoMapper.copiarDados(request, aluno);

        return alunoMapper.paraResponse(alunoRepository.save(aluno));
    }

    @Transactional
    public AlunoResponse atualizar(UUID id, AlunoRequest request, UUID escolaUsuarioId) {
        Aluno aluno = buscarEntidade(id, escolaUsuarioId);
        validarTurma(request.turmaId(), escolaUsuarioId);
        alunoMapper.copiarDados(request, aluno);

        return alunoMapper.paraResponse(alunoRepository.save(aluno));
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscarPorId(UUID id, UUID escolaUsuarioId) {
        return alunoMapper.paraResponse(buscarEntidade(id, escolaUsuarioId));
    }

    @Transactional(readOnly = true)
    public Page<AlunoResponse> listar(Pageable pageable, UUID filtroEscolaId, String nome, UUID escolaUsuarioId) {
        validarFiltroEscola(filtroEscolaId, escolaUsuarioId);
        boolean temNome = nome != null && !nome.isBlank();

        List<UUID> turmaIds = turmaRepository.findByEscolaId(escolaUsuarioId).stream()
                .map(turma -> turma.getId())
                .toList();

        if (turmaIds.isEmpty()) return Page.empty(pageable);

        if (temNome) {
            return alunoRepository.findByTurmaIdInAndNomeContainingIgnoreCase(turmaIds, nome, pageable)
                    .map(alunoMapper::paraResponse);
        }

        return alunoRepository.findByTurmaIdIn(turmaIds, pageable).map(alunoMapper::paraResponse);
    }

    @Transactional
    public void desativar(UUID id, UUID escolaUsuarioId) {
        Aluno aluno = buscarEntidade(id, escolaUsuarioId);
        aluno.setAtivo(false);
        alunoRepository.save(aluno);
    }

    @Transactional
    public void ativar(UUID id, UUID escolaUsuarioId) {
        Aluno aluno = buscarEntidade(id, escolaUsuarioId);
        aluno.setAtivo(true);
        alunoRepository.save(aluno);
    }

    private Aluno buscarEntidade(UUID id, UUID escolaUsuarioId) {
        if (escolaUsuarioId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado"));
        if (!turmaRepository.existsByIdAndEscolaId(aluno.getTurmaId(), escolaUsuarioId)) {
            throw new RecursoNaoEncontradoException("Aluno não encontrado");
        }
        return aluno;
    }

    private void validarTurma(UUID turmaId, UUID escolaUsuarioId) {
        if (escolaUsuarioId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        if (!turmaRepository.existsByIdAndEscolaId(turmaId, escolaUsuarioId)) {
            throw new RecursoNaoEncontradoException("Turma não encontrada");
        }
    }

    private void validarFiltroEscola(UUID filtroEscolaId, UUID escolaUsuarioId) {
        if (escolaUsuarioId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        if (filtroEscolaId != null && !filtroEscolaId.equals(escolaUsuarioId)) {
            throw new RecursoNaoEncontradoException("Escola não encontrada");
        }
    }
}
