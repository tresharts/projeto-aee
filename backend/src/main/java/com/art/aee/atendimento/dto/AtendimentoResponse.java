package com.art.aee.atendimento.dto;

import com.art.aee.atendimento.Foco;
import com.art.aee.atendimento.Humor;
import com.art.aee.atendimento.Participacao;
import com.art.aee.atendimento.Desenvolvimento;
import com.art.aee.atendimento.NivelEvolucao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AtendimentoResponse(
        UUID id,
        UUID alunoId,
        String nomeAluno,
        UUID professorId,
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
        List<AtendimentoObjetivoResponse> objetivosPei,
        boolean presente,
        LocalDateTime dataCadastro
) {}
