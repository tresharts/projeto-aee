package com.art.aee.atendimento;

import com.art.aee.aluno.AlunoRepository;
import com.art.aee.atendimento.dto.AtendimentoRequest;
import com.art.aee.atendimento.dto.AtendimentoResponse;
import org.springframework.stereotype.Component;

@Component
public class AtendimentoMapper {

    private final AlunoRepository alunoRepository;

    public AtendimentoMapper(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    public void copiarDados(AtendimentoRequest request, Atendimento atendimento) {
        atendimento.setAlunoId(request.alunoId());
        atendimento.setProfessorId(request.professorId());
        atendimento.setDataHora(request.dataHora());
        atendimento.setHumor(request.humor());
        atendimento.setFoco(request.foco());
        atendimento.setObservacoes(request.observacoes());
        atendimento.setPresente(request.presente());
    }

    public AtendimentoResponse paraResponse(Atendimento atendimento) {
        String nomeAluno = null;

        if (atendimento.getAlunoId() != null) {
            nomeAluno = alunoRepository.findById(atendimento.getAlunoId())
                    .map(aluno -> aluno.getNome())
                    .orElse(null);
        }

        return new AtendimentoResponse(
                atendimento.getId(),
                atendimento.getAlunoId(),
                nomeAluno,
                atendimento.getProfessorId(),
                atendimento.getDataHora(),
                atendimento.getHumor(),
                atendimento.getFoco(),
                atendimento.getObservacoes(),
                atendimento.getPresente(),
                atendimento.getDataCadastro()
        );
    }
}
