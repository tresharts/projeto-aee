package com.art.aee.atendimento.dto;

import com.art.aee.atendimento.Foco;
import com.art.aee.atendimento.Humor;
import com.art.aee.atendimento.Desenvolvimento;
import com.art.aee.atendimento.NivelEvolucao;
import com.art.aee.atendimento.Participacao;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AtendimentoRequest(
        @NotNull(message = "Aluno é obrigatório")
        UUID alunoId,

        @NotNull(message = "Data e hora são obrigatórias")
        @PastOrPresent(message = "Data e hora não podem ser futuras")
        LocalDateTime dataHora,

        Humor humor,

        Foco foco,

        Participacao participacao,

        Desenvolvimento desenvolvimento,

        String humorOutro,

        String atividadeRealizada,

        String recursosUtilizados,

        String habilidadesTrabalhadas,

        String observacoes,

        String estrategiasUtilizadas,

        String proximosPassos,

        NivelEvolucao evolucaoParticipacao,

        NivelEvolucao evolucaoComunicacao,

        NivelEvolucao evolucaoAtencao,

        NivelEvolucao evolucaoAutonomia,

        @Valid List<AtendimentoObjetivoRequest> objetivosPei,

        @NotNull(message = "Presença é obrigatória")
        Boolean presente
) {}
