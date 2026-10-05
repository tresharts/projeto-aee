package com.art.aee.aluno;

import com.art.aee.aluno.dto.AlunoRequest;
import com.art.aee.aluno.dto.AlunoResponse;
import com.art.aee.escola.EscolaRepository;
import com.art.aee.turma.TurmaRepository;
import org.springframework.stereotype.Component;

@Component
public class AlunoMapper {

    private final TurmaRepository turmaRepository;
    private final EscolaRepository escolaRepository;

    public AlunoMapper(TurmaRepository turmaRepository, EscolaRepository escolaRepository) {
        this.turmaRepository = turmaRepository;
        this.escolaRepository = escolaRepository;
    }

    public void copiarDados(AlunoRequest request, Aluno aluno) {
        aluno.setNome(request.nome());
        aluno.setDataNascimento(request.dataNascimento());
        aluno.setDiagnostico(request.diagnostico());
        aluno.setFotoUrl(request.fotoUrl());
        aluno.setInformacoesFamilia(request.informacoesFamilia());
        aluno.setContatosEmergencia(request.contatosEmergencia());
        aluno.setEmail(request.email());
        aluno.setTelefone(request.telefone());
        aluno.setTurmaId(request.turmaId());
    }

    public AlunoResponse paraResponse(Aluno aluno) {
        String nomeTurma = null;
        String nomeEscola = null;

        if (aluno.getTurmaId() != null) {
            var turma = turmaRepository.findById(aluno.getTurmaId()).orElse(null);

            if (turma != null) {
                nomeTurma = turma.getNome();

                if (turma.getEscolaId() != null) {
                    nomeEscola = escolaRepository.findById(turma.getEscolaId())
                            .map(escola -> escola.getNome())
                            .orElse(null);
                }
            }
        }

        return new AlunoResponse(
                aluno.getId(),
                aluno.getNome(),
                aluno.getDataNascimento(),
                aluno.getDiagnostico(),
                aluno.getFotoUrl(),
                aluno.getInformacoesFamilia(),
                aluno.getContatosEmergencia(),
                aluno.getEmail(),
                aluno.getTelefone(),
                aluno.isAtivo(),
                aluno.getDataCadastro(),
                aluno.getTurmaId(),
                nomeTurma,
                nomeEscola
        );
    }
}
