package com.art.aee.turma;

import com.art.aee.escola.EscolaRepository;
import com.art.aee.turma.dto.TurmaRequest;
import com.art.aee.turma.dto.TurmaResponse;
import org.springframework.stereotype.Component;

@Component
public class TurmaMapper {

    private final EscolaRepository escolaRepository;

    public TurmaMapper(EscolaRepository escolaRepository) {
        this.escolaRepository = escolaRepository;
    }

    public void copiarDados(TurmaRequest request, Turma turma) {
        turma.setNome(request.nome());
        turma.setAno(request.ano());
        turma.setEscolaId(request.escolaId());
    }

    public TurmaResponse paraResponse(Turma turma) {
        String nomeEscola = null;

        if (turma.getEscolaId() != null) {
            nomeEscola = escolaRepository.findById(turma.getEscolaId())
                    .map(escola -> escola.getNome())
                    .orElse(null);
        }

        return new TurmaResponse(
                turma.getId(),
                turma.getNome(),
                turma.getAno(),
                turma.getEscolaId(),
                nomeEscola
        );
    }
}
