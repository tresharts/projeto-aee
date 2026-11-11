package com.art.aee.sessao.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record SessaoRequest(
        @NotNull(message = "Aluno é obrigatório") UUID alunoId,
        @NotNull(message = "Data e horário são obrigatórios")
        @FutureOrPresent(message = "A sessão não pode ser agendada no passado") LocalDateTime dataHora,
        String observacao
) {}
