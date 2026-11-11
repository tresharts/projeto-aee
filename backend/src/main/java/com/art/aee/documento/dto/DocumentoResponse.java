package com.art.aee.documento.dto;

import com.art.aee.documento.TipoDocumento;

import java.time.LocalDateTime;
import java.util.UUID;

public record DocumentoResponse(
        UUID id,
        UUID alunoId,
        String nomeArquivo,
        String tipoConteudo,
        Long tamanhoBytes,
        TipoDocumento tipoDocumento,
        LocalDateTime dataUpload
) {}
