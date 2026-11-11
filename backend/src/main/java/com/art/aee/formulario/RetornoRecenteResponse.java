package com.art.aee.formulario;

import java.time.LocalDateTime;
import java.util.UUID;

public record RetornoRecenteResponse(UUID id, UUID alunoId, String nomeAluno,
                                     String nomeProfessorEscola, String mensagem,
                                     LocalDateTime dataEnvio) {}
