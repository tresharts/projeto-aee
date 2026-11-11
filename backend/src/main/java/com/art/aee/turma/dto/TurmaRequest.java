package com.art.aee.turma.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TurmaRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @NotNull(message = "Ano é obrigatório")
        Integer ano,

        @NotNull(message = "Escola é obrigatória")
        UUID escolaId
) {}
