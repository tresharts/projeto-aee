package com.art.aee.aluno.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AlunoResponse(
        UUID id,
        String nome,
        LocalDate dataNascimento,
        String diagnostico,
        String fotoUrl,
        String informacoesFamilia,
        String contatosEmergencia,
        String email,
        String telefone,
        boolean ativo,
        LocalDateTime dataCadastro,
        UUID turmaId,
        String nomeTurma,
        String nomeEscola
) {
}