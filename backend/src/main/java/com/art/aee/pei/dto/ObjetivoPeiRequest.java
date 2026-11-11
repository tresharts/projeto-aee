package com.art.aee.pei.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ObjetivoPeiRequest(
        UUID documentoPeiId,
        @NotBlank(message = "A descrição do objetivo é obrigatória")
        @Size(max = 2000, message = "A descrição do objetivo não pode ultrapassar 2000 caracteres")
        String descricao
) {}
