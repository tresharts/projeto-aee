package com.art.aee.aluno;

import com.art.aee.aluno.dto.AlunoRequest;
import com.art.aee.aluno.dto.AlunoResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository; // Assumindo que este repositório já existe no seu projeto

    public AlunoService(AlunoRepository alunoRepository, TurmaRepository turmaRepository) {
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
    }

    @Transactional
    public AlunoResponse criar(AlunoRequest request) {
        validarTurma(request.turmaId());

        Aluno aluno = new Aluno();
        copiarDadosDoRequestParaEntidade(request, aluno);

        aluno = alunoRepository.save(aluno);
        return paraResponse(aluno);
    }

    @Transactional
    public AlunoResponse atualizar(UUID id, AlunoRequest request) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));

        // Se a turma foi alterada, validamos se a nova existe
        if (!aluno.getTurmaId().equals(request.turmaId())) {
            validarTurma(request.turmaId());
        }

        copiarDadosDoRequestParaEntidade(request, aluno);

        aluno = alunoRepository.save(aluno);
        return paraResponse(aluno);
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscarPorId(UUID id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        return paraResponse(aluno);
    }

    @Transactional(readOnly = true)
    public Page<AlunoResponse> listar(Pageable pageable, UUID escolaId, String nome) {
        boolean temEscola = escolaId != null;
        boolean temNome = nome != null && !nome.isBlank();

        // Variável para armazenar o resultado da busca (List ou Page)
        List<Aluno> alunosList;

        if (temEscola && temNome) {
            alunosList = alunoRepository.findByTurmaEscolaIdAndNomeContainingIgnoreCase(escolaId, nome, pageable);
        } else if (temEscola) {
            alunosList = alunoRepository.findByTurmaEscolaId(escolaId, pageable);
        } else if (temNome) {
            alunosList = alunoRepository.findByNomeContainingIgnoreCase(nome, pageable);
        } else {
            // Quando não há filtros, usamos o findAll padrão que já retorna Page
            return alunoRepository.findAll(pageable).map(this::paraResponse);
        }

        // Como os métodos customizados no Repository retornavam List, convertemos para Page e depois mapeamos para DTO
        List<AlunoResponse> content = alunosList.stream()
                .map(this::paraResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(content, pageable, content.size());
    }

    @Transactional
    public void desativar(UUID id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));

        aluno.setAtivo(false);
        alunoRepository.save(aluno);
    }

    // --- Métodos Privados Auxiliares ---

    private void validarTurma(UUID turmaId) {
        if (!turmaRepository.existsById(turmaId)) {
            throw new EntityNotFoundException("Turma não encontrada");
        }
    }

    private void copiarDadosDoRequestParaEntidade(AlunoRequest request, Aluno aluno) {
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
        String nomeTurma = "Turma não encontrada";
        String nomeEscola = "Escola não encontrada";

        // Busca a turma para extrair o nome dela e da escola
        if (aluno.getTurmaId() != null) {
            var turmaOpt = turmaRepository.findById(aluno.getTurmaId());
            if (turmaOpt.isPresent()) {
                var turma = turmaOpt.get();
                // Assumindo os getters básicos das suas classes Turma e Escola
                nomeTurma = turma.getNome();
                if (turma.getEscola() != null) {
                    nomeEscola = turma.getEscola().getNome();
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