package com.art.aee.sessao.dto;

import java.util.UUID;

public record FaltaConsecutivaResponse(UUID alunoId, String nomeAluno, int quantidade) {}
