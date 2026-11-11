package com.art.aee.atendimento.dto;

import com.art.aee.atendimento.NivelEvolucao;

import java.util.UUID;

public record AtendimentoObjetivoResponse(
        UUID objetivoPeiId,
        String descricaoObjetivo,
        NivelEvolucao nivel,
        String observacao
) {}
