package com.art.aee.formulario.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record FormularioRespostaRequest(
        @NotEmpty @Size(max = 30) List<@NotNull @Size(max = 5000) String> respostas
) {}
