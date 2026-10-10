package com.art.aee.atendimento.dto;

import com.art.aee.atendimento.Foco;
import com.art.aee.atendimento.Humor;

import java.time.LocalDateTime;
import java.util.UUID;

public record AtendimentoResponse(
        UUID id,
        UUID alunoId,
        String nomeAluno,
        UUID professorId,
        LocalDateTime dataHora,
        Humor humor,
        Foco foco,
        String observacoes,
        boolean presente,
        LocalDateTime dataCadastro
) {}
