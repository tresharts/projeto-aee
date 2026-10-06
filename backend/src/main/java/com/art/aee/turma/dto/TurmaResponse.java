package com.art.aee.turma.dto;

import java.util.UUID;

public record TurmaResponse(
        UUID id,
        String nome,
        Integer ano,
        UUID escolaId,
        String nomeEscola
) {}
