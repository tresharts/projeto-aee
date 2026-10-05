package com.art.aee.aluno;

import com.art.aee.aluno.dto.AlunoRequest;
import com.art.aee.aluno.dto.AlunoResponse;
import com.art.aee.turma.TurmaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
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
    public AlunoResponse criar(AlunoRequest request) {
        validarTurma(request.turmaId());

        Aluno aluno = new Aluno();
        alunoMapper.copiarDados(request, aluno);

        return alunoMapper.paraResponse(alunoRepository.save(aluno));
    }

    @Transactional
    public AlunoResponse atualizar(UUID id, AlunoRequest request) {
        Aluno aluno = buscarEntidade(id);

        if (!Objects.equals(aluno.getTurmaId(), request.turmaId())) {
            validarTurma(request.turmaId());
        }
        alunoMapper.copiarDados(request, aluno);

        return alunoMapper.paraResponse(alunoRepository.save(aluno));
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscarPorId(UUID id) {
        return alunoMapper.paraResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public Page<AlunoResponse> listar(Pageable pageable, UUID escolaId, String nome) {
        boolean temNome = nome != null && !nome.isBlank();

        if (escolaId != null) {
            List<UUID> turmaIds = turmaRepository.findByEscolaId(escolaId).stream()
                    .map(turma -> turma.getId())
                    .toList();

            if (turmaIds.isEmpty()) {
                return Page.empty(pageable);
            }

            if (temNome) {
                return alunoRepository
                        .findByTurmaIdInAndNomeContainingIgnoreCase(turmaIds, nome, pageable)
                        .map(alunoMapper::paraResponse);
            }

            return alunoRepository
                    .findByTurmaIdIn(turmaIds, pageable)
                    .map(alunoMapper::paraResponse);
        }

        if (temNome) {
            return alunoRepository
                    .findByNomeContainingIgnoreCase(nome, pageable)
                    .map(alunoMapper::paraResponse);
        }

        return alunoRepository.findAll(pageable).map(alunoMapper::paraResponse);
    }

    @Transactional
    public void desativar(UUID id) {
        Aluno aluno = buscarEntidade(id);
        aluno.setAtivo(false);
        alunoRepository.save(aluno);
    }

    @Transactional
    public void ativar(UUID id) {
        Aluno aluno = buscarEntidade(id);
        aluno.setAtivo(true);
        alunoRepository.save(aluno);
    }

    private Aluno buscarEntidade(UUID id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
    }

    private void validarTurma(UUID turmaId) {
        if (!turmaRepository.existsById(turmaId)) {
            throw new EntityNotFoundException("Turma não encontrada");
        }
    }
}
