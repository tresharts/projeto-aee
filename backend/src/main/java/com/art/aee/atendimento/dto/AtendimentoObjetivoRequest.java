package com.art.aee.atendimento.dto;

import com.art.aee.atendimento.NivelEvolucao;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AtendimentoObjetivoRequest(
        @NotNull(message = "O objetivo do PEI é obrigatório") UUID objetivoPeiId,
        @NotNull(message = "O nível de progresso do objetivo é obrigatório") NivelEvolucao nivel,
        String observacao
) {}
