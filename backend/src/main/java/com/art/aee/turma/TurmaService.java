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
    public TurmaResponse criar(TurmaRequest request, UUID escolaUsuarioId) {
        validarEscola(request.escolaId(), escolaUsuarioId);

        Turma turma = new Turma();
        turmaMapper.copiarDados(request, turma);

        return turmaMapper.paraResponse(turmaRepository.save(turma));
    }

    @Transactional
    public TurmaResponse atualizar(UUID id, TurmaRequest request, UUID escolaUsuarioId) {
        Turma turma = buscarEntidade(id, escolaUsuarioId);
        validarEscola(request.escolaId(), escolaUsuarioId);
        turmaMapper.copiarDados(request, turma);

        return turmaMapper.paraResponse(turmaRepository.save(turma));
    }

    @Transactional(readOnly = true)
    public TurmaResponse buscarPorId(UUID id, UUID escolaUsuarioId) {
        return turmaMapper.paraResponse(buscarEntidade(id, escolaUsuarioId));
    }

    @Transactional(readOnly = true)
    public Page<TurmaResponse> listar(Pageable pageable, UUID filtroEscolaId, String nome, UUID escolaUsuarioId) {
        validarFiltroEscola(filtroEscolaId, escolaUsuarioId);
        boolean temNome = nome != null && !nome.isBlank();

        if (temNome) {
            return turmaRepository
                    .findByEscolaIdAndNomeContainingIgnoreCase(escolaUsuarioId, nome, pageable)
                    .map(turmaMapper::paraResponse);
        }

        return turmaRepository.findByEscolaId(escolaUsuarioId, pageable).map(turmaMapper::paraResponse);
    }

    @Transactional
    public void remover(UUID id, UUID escolaUsuarioId) {
        Turma turma = buscarEntidade(id, escolaUsuarioId);

        if (alunoRepository.existsByTurmaId(id)) {
            throw new ConflitoException("Não é possível remover turma com alunos vinculados");
        }

        turmaRepository.delete(turma);
    }

    private Turma buscarEntidade(UUID id, UUID escolaUsuarioId) {
        return turmaRepository.findById(id)
                .filter(turma -> turma.getEscolaId().equals(escolaUsuarioId))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Turma não encontrada"));
    }

    private void validarEscola(UUID escolaId, UUID escolaUsuarioId) {
        validarFiltroEscola(escolaId, escolaUsuarioId);
        if (!escolaRepository.existsById(escolaId)) {
            throw new RecursoNaoEncontradoException("Escola não encontrada");
        }
    }

    private void validarFiltroEscola(UUID filtroEscolaId, UUID escolaUsuarioId) {
        if (escolaUsuarioId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        if (filtroEscolaId != null && !filtroEscolaId.equals(escolaUsuarioId)) {
            throw new RecursoNaoEncontradoException("Escola não encontrada");
        }
    }
}
