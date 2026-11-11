package com.art.aee.documento;

import com.art.aee.documento.dto.DocumentoResponse;
import org.springframework.stereotype.Component;

@Component
public class DocumentoMapper {

    public DocumentoResponse paraResponse(Documento documento) {
        return new DocumentoResponse(
                documento.getId(),
                documento.getAlunoId(),
                documento.getNomeArquivo(),
                documento.getTipoConteudo(),
                documento.getTamanhoBytes(),
                documento.getTipoDocumento(),
                documento.getDataUpload()
        );
    }
}
