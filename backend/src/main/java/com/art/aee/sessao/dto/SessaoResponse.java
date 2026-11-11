package com.art.aee.sessao.dto;

import com.art.aee.sessao.SessaoStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record SessaoResponse(
        UUID id,
        UUID alunoId,
        String nomeAluno,
        String nomeTurma,
        String nomeEscola,
        LocalDateTime dataHora,
        SessaoStatus status,
        String observacao,
        UUID atendimentoId
) {}
