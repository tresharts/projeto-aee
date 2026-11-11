package com.art.aee.formulario.dto;

import java.util.List;

public record FormularioPublicoResponse(String alunoNome, List<String> perguntas, String status) {}
