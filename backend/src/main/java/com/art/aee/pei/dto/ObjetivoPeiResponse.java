package com.art.aee.pei.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ObjetivoPeiResponse(
        UUID id,
        UUID alunoId,
        UUID documentoPeiId,
        String descricao,
        boolean ativo,
        LocalDateTime dataCadastro
) {}
