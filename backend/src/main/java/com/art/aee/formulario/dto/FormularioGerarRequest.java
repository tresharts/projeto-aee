package com.art.aee.formulario.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record FormularioGerarRequest(
        @NotNull UUID alunoId,
        @NotEmpty @Size(max = 30) List<@NotNull @Size(max = 500) String> perguntas
) {}
