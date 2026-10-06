package com.art.aee.escola.dto;

import java.util.UUID;

public record EscolaResponse(
        UUID id,
        String nome
) {}