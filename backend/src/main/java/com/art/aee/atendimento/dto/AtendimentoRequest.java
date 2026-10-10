package com.art.aee.atendimento.dto;

import com.art.aee.atendimento.Foco;
import com.art.aee.atendimento.Humor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDateTime;
import java.util.UUID;

public record AtendimentoRequest(
        @NotNull(message = "Aluno é obrigatório")
        UUID alunoId,

        UUID professorId,

        @NotNull(message = "Data e hora são obrigatórias")
        @PastOrPresent(message = "Data e hora não podem ser futuras")
        LocalDateTime dataHora,

        Humor humor,

        Foco foco,

        String observacoes,

        @NotNull(message = "Presença é obrigatória")
        Boolean presente
) {}
