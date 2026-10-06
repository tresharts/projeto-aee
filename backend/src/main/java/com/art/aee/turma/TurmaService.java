package com.art.aee.turma;

import com.art.aee.aluno.AlunoRepository;
import com.art.aee.escola.EscolaRepository;
import com.art.aee.turma.dto.TurmaRequest;
import com.art.aee.turma.dto.TurmaResponse;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.RecursoNaoEncontradoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final AlunoRepository alunoRepository;
    private final EscolaRepository escolaRepository;
    private final TurmaMapper turmaMapper;

    public TurmaService(
            TurmaRepository turmaRepository,
            AlunoRepository alunoRepository,
            EscolaRepository escolaRepository,
            TurmaMapper turmaMapper) {
        this.turmaRepository = turmaRepository;
        this.alunoRepository = alunoRepository;
        this.escolaRepository = escolaRepository;
        this.turmaMapper = turmaMapper;
    }

    @Transactional
    public TurmaResponse criar(TurmaRequest request) {
        validarEscola(request.escolaId());

        Turma turma = new Turma();
        turmaMapper.copiarDados(request, turma);

        return turmaMapper.paraResponse(turmaRepository.save(turma));
    }

    @Transactional
    public TurmaResponse atualizar(UUID id, TurmaRequest request) {
        Turma turma = buscarEntidade(id);
        validarEscola(request.escolaId());
        turmaMapper.copiarDados(request, turma);

        return turmaMapper.paraResponse(turmaRepository.save(turma));
    }

    @Transactional(readOnly = true)
    public TurmaResponse buscarPorId(UUID id) {
        return turmaMapper.paraResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public Page<TurmaResponse> listar(Pageable pageable, UUID escolaId, String nome) {
        boolean temNome = nome != null && !nome.isBlank();

        if (escolaId != null && temNome) {
            return turmaRepository
                    .findByEscolaIdAndNomeContainingIgnoreCase(escolaId, nome, pageable)
                    .map(turmaMapper::paraResponse);
        }

        if (escolaId != null) {
            return turmaRepository
                    .findByEscolaId(escolaId, pageable)
                    .map(turmaMapper::paraResponse);
        }

        if (temNome) {
            return turmaRepository
                    .findByNomeContainingIgnoreCase(nome, pageable)
                    .map(turmaMapper::paraResponse);
        }

        return turmaRepository.findAll(pageable).map(turmaMapper::paraResponse);
    }

    @Transactional
    public void remover(UUID id) {
        Turma turma = buscarEntidade(id);

        if (alunoRepository.existsByTurmaId(id)) {
            throw new ConflitoException("Não é possível remover turma com alunos vinculados");
        }

        turmaRepository.delete(turma);
    }

    private Turma buscarEntidade(UUID id) {
        return turmaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Turma não encontrada"));
    }

    private void validarEscola(UUID escolaId) {
        if (!escolaRepository.existsById(escolaId)) {
            throw new RecursoNaoEncontradoException("Escola não encontrada");
        }
    }
}
