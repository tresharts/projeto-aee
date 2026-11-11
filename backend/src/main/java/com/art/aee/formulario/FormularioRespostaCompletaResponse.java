package com.art.aee.formulario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record FormularioRespostaCompletaResponse(UUID id, UUID alunoId, String nomeAluno,
                                                 List<String> perguntas, List<String> respostas,
                                                 LocalDateTime dataResposta) {}
