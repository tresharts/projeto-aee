package com.art.aee.aluno;

import com.art.aee.aluno.dto.AlunoRequest;
import com.art.aee.aluno.dto.AlunoResponse;
import com.art.aee.escola.EscolaRepository;
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
    private final EscolaRepository escolaRepository;

    public AlunoService(
            AlunoRepository alunoRepository,
            TurmaRepository turmaRepository,
            EscolaRepository escolaRepository) {
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
        this.escolaRepository = escolaRepository;
    }

    @Transactional
    public AlunoResponse criar(AlunoRequest request) {
        validarTurma(request.turmaId());

        Aluno aluno = new Aluno();
        copiarDados(request, aluno);

        return paraResponse(alunoRepository.save(aluno));
    }

    @Transactional
    public AlunoResponse atualizar(UUID id, AlunoRequest request) {
        Aluno aluno = buscarEntidade(id);

        if (!Objects.equals(aluno.getTurmaId(), request.turmaId())) {
            validarTurma(request.turmaId());
        }
        copiarDados(request, aluno);

        return paraResponse(alunoRepository.save(aluno));
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscarPorId(UUID id) {
        return paraResponse(buscarEntidade(id));
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
                        .map(this::paraResponse);
            }

            return alunoRepository
                    .findByTurmaIdIn(turmaIds, pageable)
                    .map(this::paraResponse);
        }

        if (temNome) {
            return alunoRepository
                    .findByNomeContainingIgnoreCase(nome, pageable)
                    .map(this::paraResponse);
        }

        return alunoRepository.findAll(pageable).map(this::paraResponse);
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

    private void copiarDados(AlunoRequest request, Aluno aluno) {
        aluno.setNome(request.nome());
        aluno.setDataNascimento(request.dataNascimento());
        aluno.setDiagnostico(request.diagnostico());
        aluno.setFotoUrl(request.fotoUrl());
        aluno.setInformacoesFamilia(request.informacoesFamilia());
        aluno.setContatosEmergencia(request.contatosEmergencia());
        aluno.setEmail(request.email());
        aluno.setTelefone(request.telefone());
        aluno.setTurmaId(request.turmaId());
    }

    private AlunoResponse paraResponse(Aluno aluno) {
        String nomeTurma = null;
        String nomeEscola = null;

        if (aluno.getTurmaId() != null) {
            var turma = turmaRepository.findById(aluno.getTurmaId()).orElse(null);

            if (turma != null) {
                nomeTurma = turma.getNome();

                if (turma.getEscolaId() != null) {
                    nomeEscola = escolaRepository.findById(turma.getEscolaId())
                            .map(escola -> escola.getNome())
                            .orElse(null);
                }
            }
        }

        return new AlunoResponse(
                aluno.getId(),
                aluno.getNome(),
                aluno.getDataNascimento(),
                aluno.getDiagnostico(),
                aluno.getFotoUrl(),
                aluno.getInformacoesFamilia(),
                aluno.getContatosEmergencia(),
                aluno.getEmail(),
                aluno.getTelefone(),
                aluno.isAtivo(),
                aluno.getDataCadastro(),
                aluno.getTurmaId(),
                nomeTurma,
                nomeEscola
        );
    }
}
