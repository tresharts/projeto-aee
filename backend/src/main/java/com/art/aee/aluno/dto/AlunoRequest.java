package com.art.aee.aluno.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record AlunoRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @NotNull(message = "Data de nascimento é obrigatória")
        @Past(message = "Data de nascimento não pode ser futura")
        LocalDate dataNascimento,

        String diagnostico,
        String fotoUrl,
        String informacoesFamilia,
        String contatosEmergencia,

        @Email(message = "Email inválido")
        String email,

        String telefone,

        @NotNull(message = "Turma é obrigatória")
        UUID turmaId
) {
}