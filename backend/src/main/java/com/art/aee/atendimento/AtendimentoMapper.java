package com.art.aee.atendimento;

import com.art.aee.aluno.AlunoRepository;
import com.art.aee.atendimento.dto.AtendimentoRequest;
import com.art.aee.atendimento.dto.AtendimentoResponse;
import org.springframework.stereotype.Component;

@Component
public class AtendimentoMapper {

    private final AlunoRepository alunoRepository;
    private final AtendimentoObjetivoPeiRepository atendimentoObjetivoPeiRepository;

    public AtendimentoMapper(AlunoRepository alunoRepository,
                             AtendimentoObjetivoPeiRepository atendimentoObjetivoPeiRepository) {
        this.alunoRepository = alunoRepository;
        this.atendimentoObjetivoPeiRepository = atendimentoObjetivoPeiRepository;
    }

    public void copiarDados(AtendimentoRequest request, Atendimento atendimento) {
        atendimento.setAlunoId(request.alunoId());
        atendimento.setDataHora(request.dataHora());
        if (request.humor() != null) {
            atendimento.setHumor(request.humor());
            if (request.humor() != Humor.OUTRO) atendimento.setHumorOutro(null);
        }
        if (request.foco() != null) atendimento.setFoco(request.foco());
        if (request.participacao() != null) atendimento.setParticipacao(request.participacao());
        if (request.desenvolvimento() != null) atendimento.setDesenvolvimento(request.desenvolvimento());
        if (request.humorOutro() != null && (request.humor() == null || request.humor() == Humor.OUTRO)) {
            atendimento.setHumorOutro(textoOuNulo(request.humorOutro()));
        }
        if (request.atividadeRealizada() != null) atendimento.setAtividadeRealizada(textoOuNulo(request.atividadeRealizada()));
        if (request.recursosUtilizados() != null) atendimento.setRecursosUtilizados(textoOuNulo(request.recursosUtilizados()));
        if (request.habilidadesTrabalhadas() != null) atendimento.setHabilidadesTrabalhadas(textoOuNulo(request.habilidadesTrabalhadas()));
        if (request.observacoes() != null) atendimento.setObservacoes(textoOuNulo(request.observacoes()));
        if (request.estrategiasUtilizadas() != null) atendimento.setEstrategiasUtilizadas(textoOuNulo(request.estrategiasUtilizadas()));
        if (request.proximosPassos() != null) atendimento.setProximosPassos(textoOuNulo(request.proximosPassos()));
        if (request.evolucaoParticipacao() != null) atendimento.setEvolucaoParticipacao(request.evolucaoParticipacao());
        if (request.evolucaoComunicacao() != null) atendimento.setEvolucaoComunicacao(request.evolucaoComunicacao());
        if (request.evolucaoAtencao() != null) atendimento.setEvolucaoAtencao(request.evolucaoAtencao());
        if (request.evolucaoAutonomia() != null) atendimento.setEvolucaoAutonomia(request.evolucaoAutonomia());
        atendimento.setPresente(request.presente());
    }

    private String textoOuNulo(String valor) {
        return valor.isBlank() ? null : valor.trim();
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
                atendimento.getParticipacao(),
                atendimento.getDesenvolvimento(),
                atendimento.getHumorOutro(),
                atendimento.getAtividadeRealizada(),
                atendimento.getRecursosUtilizados(),
                atendimento.getHabilidadesTrabalhadas(),
                atendimento.getObservacoes(),
                atendimento.getEstrategiasUtilizadas(),
                atendimento.getProximosPassos(),
                atendimento.getEvolucaoParticipacao(),
                atendimento.getEvolucaoComunicacao(),
                atendimento.getEvolucaoAtencao(),
                atendimento.getEvolucaoAutonomia(),
                atendimentoObjetivoPeiRepository.findByAtendimentoId(atendimento.getId()).stream()
                        .map(objetivo -> new com.art.aee.atendimento.dto.AtendimentoObjetivoResponse(
                                objetivo.getObjetivoPeiId(), objetivo.getDescricaoObjetivo(),
                                objetivo.getNivel(), objetivo.getObservacao()))
                        .toList(),
                atendimento.getPresente(),
                atendimento.getDataCadastro()
        );
    }
}
