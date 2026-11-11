package com.art.aee.escola;

import com.art.aee.escola.dto.EscolaRequest;
import com.art.aee.escola.dto.EscolaResponse;
import org.springframework.stereotype.Component;

@Component
public class EscolaMapper {

    public void copiarDados(EscolaRequest request, Escola escola) {
        escola.setNome(request.nome());
    }

    public EscolaResponse paraResponse(Escola escola) {
        return new EscolaResponse(
                escola.getId(),
                escola.getNome()
        );
    }
}
