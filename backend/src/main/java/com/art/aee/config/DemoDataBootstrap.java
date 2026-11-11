package com.art.aee.config;

import com.art.aee.aluno.Aluno;
import com.art.aee.aluno.AlunoRepository;
import com.art.aee.atendimento.*;
import com.art.aee.escola.Escola;
import com.art.aee.escola.EscolaRepository;
import com.art.aee.formulario.FormularioExterno;
import com.art.aee.formulario.FormularioExternoRepository;
import com.art.aee.pei.ObjetivoPei;
import com.art.aee.pei.ObjetivoPeiRepository;
import com.art.aee.professor.*;
import com.art.aee.sessao.SessaoAgendada;
import com.art.aee.sessao.SessaoAgendadaRepository;
import com.art.aee.turma.Turma;
import com.art.aee.turma.TurmaRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@Order(10)
@ConditionalOnProperty(name = "aee.demo.seed.enabled", havingValue = "true")
public class DemoDataBootstrap implements ApplicationRunner {
    public static final String SCHOOL_NAME = "Escola Demonstração AEE";
    public static final String TEACHER_EMAIL = "professora.demo@aee.local";
    public static final String ADMIN_EMAIL = "coordenacao.demo@aee.local";
    public static final String DEMO_PASSWORD = "AeeDemo2026!";

    private final EscolaRepository escolas;
    private final ProfessorRepository professores;
    private final TurmaRepository turmas;
    private final AlunoRepository alunos;
    private final AtendimentoRepository atendimentos;
    private final SessaoAgendadaRepository sessoes;
    private final ObjetivoPeiRepository objetivos;
    private final FormularioExternoRepository formularios;
    private final PasswordEncoder encoder;

    public DemoDataBootstrap(EscolaRepository escolas, ProfessorRepository professores,
                             TurmaRepository turmas, AlunoRepository alunos,
                             AtendimentoRepository atendimentos, SessaoAgendadaRepository sessoes,
                             ObjetivoPeiRepository objetivos, FormularioExternoRepository formularios,
                             PasswordEncoder encoder) {
        this.escolas = escolas;
        this.professores = professores;
        this.turmas = turmas;
        this.alunos = alunos;
        this.atendimentos = atendimentos;
        this.sessoes = sessoes;
        this.objetivos = objetivos;
        this.formularios = formularios;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        Escola escola = escolas.findByNomeIgnoreCase(SCHOOL_NAME).orElseGet(() ->
                escolas.save(Escola.builder().nome(SCHOOL_NAME).codigoCadastro("AEEDEMO").build()));
        Professor professora = conta(TEACHER_EMAIL, "Professora Camila", Role.PROFESSOR, escola.getId());
        conta(ADMIN_EMAIL, "Coordenação Demo", Role.ADMIN, escola.getId());

        Turma primeiroAno = turma(escola.getId(), "1º ano A");
        Turma segundoAno = turma(escola.getId(), "2º ano B");
        Aluno ana = aluno(primeiroAno.getId(), "Ana Luiza Martins", LocalDate.of(2018, 5, 12));
        Aluno joao = aluno(primeiroAno.getId(), "João Pedro Silva", LocalDate.of(2018, 9, 24));
        Aluno maria = aluno(segundoAno.getId(), "Maria Clara Santos", LocalDate.of(2017, 3, 8));
        Aluno lucas = aluno(segundoAno.getId(), "Lucas Oliveira", LocalDate.of(2017, 11, 17));
        objetivo(ana.getId(), "Ampliar a comunicação durante atividades em grupo.");
        objetivo(joao.getId(), "Participar das atividades com atenção e apoio gradual.");
        objetivo(maria.getId(), "Desenvolver autonomia nas tarefas de leitura.");

        LocalDate hoje = LocalDate.now();
        List<Aluno> presentes = List.of(ana, maria, lucas);
        for (int semana = 4; semana >= 1; semana--) {
            for (int indice = 0; indice < presentes.size(); indice++) {
                registrar(presentes.get(indice), professora, hoje.minusWeeks(semana).plusDays(indice).atTime(9 + indice, 0), true);
            }
        }
        for (int dias = 3; dias >= 1; dias--) {
            registrar(joao, professora, hoje.minusDays(dias).atTime(10, 0), false);
        }
        agendar(ana, professora, hoje.atTime(9, 0));
        agendar(joao, professora, hoje.atTime(10, 30));
        agendar(maria, professora, hoje.atTime(14, 0));
        agendar(lucas, professora, hoje.plusDays(1).atTime(9, 30));
        if (formularios.findByToken("00000000-0000-0000-0000-000000000001").isEmpty()) {
            formularios.save(FormularioExterno.builder().alunoId(ana.getId())
                    .professorId(professora.getId()).token("00000000-0000-0000-0000-000000000001")
                    .perguntas(List.of("Como foi a interação nesta semana?"))
                    .respostas(List.of("Participou das atividades em grupo com mais autonomia."))
                    .dataResposta(LocalDateTime.now()).build());
        }
    }

    private Professor conta(String email, String nome, Role role, UUID escolaId) {
        Professor conta = professores.findByEmail(email).orElseGet(() -> Professor.builder()
                .email(email).name(nome).role(role).escolaId(escolaId).build());
        if (!escolaId.equals(conta.getEscolaId()) || conta.getRole() != role) {
            throw new IllegalStateException("Conta de demonstração vinculada a outra escola ou função: " + email);
        }
        conta.setAccountStatus(AccountStatus.APPROVED);
        conta.setPassword(encoder.encode(DEMO_PASSWORD));
        return professores.save(conta);
    }

    private Turma turma(UUID escolaId, String nome) {
        return turmas.findByEscolaId(escolaId).stream().filter(item -> item.getNome().equals(nome))
                .findFirst().orElseGet(() -> turmas.save(Turma.builder()
                        .nome(nome).ano(LocalDate.now().getYear()).escolaId(escolaId).build()));
    }

    private Aluno aluno(UUID turmaId, String nome, LocalDate nascimento) {
        return alunos.findByTurmaId(turmaId, PageRequest.of(0, 100)).stream()
                .filter(item -> item.getNome().equals(nome)).findFirst()
                .orElseGet(() -> alunos.save(Aluno.builder()
                        .nome(nome).dataNascimento(nascimento).turmaId(turmaId)
                        .informacoesFamilia("Cadastro fictício para apresentação do AEE Conecta.")
                        .build()));
    }

    private void objetivo(UUID alunoId, String descricao) {
        if (objetivos.findByAlunoIdAndAtivoTrueOrderByDataCadastroDesc(alunoId).stream()
                .anyMatch(item -> item.getDescricao().equals(descricao))) return;
        ObjetivoPei objetivo = new ObjetivoPei();
        objetivo.setAlunoId(alunoId);
        objetivo.setDescricao(descricao);
        objetivos.save(objetivo);
    }

    private void registrar(Aluno aluno, Professor professora, LocalDateTime dataHora, boolean presente) {
        if (atendimentos.findByAlunoIdAndDataHoraBetween(aluno.getId(), dataHora, dataHora, PageRequest.of(0, 1))
                .hasContent()) return;
        Atendimento registro = Atendimento.builder()
                .alunoId(aluno.getId()).professorId(professora.getId()).dataHora(dataHora)
                .presente(presente).build();
        if (presente) {
            registro.setHumor(Humor.CALMO);
            registro.setFoco(Foco.MEDIO);
            registro.setParticipacao(Participacao.ATIVA);
            registro.setDesenvolvimento(Desenvolvimento.ORIENTACAO_VERBAL);
            registro.setAtividadeRealizada("Atividade de leitura, comunicação e interação.");
            registro.setObservacoes("Participou das propostas e respondeu bem às estratégias utilizadas.");
            registro.setEvolucaoAtencao(NivelEvolucao.EM_DESENVOLVIMENTO);
            registro.setEvolucaoComunicacao(NivelEvolucao.EM_DESENVOLVIMENTO);
            registro.setEvolucaoParticipacao(NivelEvolucao.EM_DESENVOLVIMENTO);
            registro.setEvolucaoAutonomia(NivelEvolucao.INICIAL);
        } else {
            registro.setObservacoes("Falta registrada no ambiente de demonstração.");
        }
        atendimentos.save(registro);
    }

    private void agendar(Aluno aluno, Professor professora, LocalDateTime dataHora) {
        boolean existe = sessoes.findByProfessorIdAndDataHoraGreaterThanEqualAndDataHoraLessThanOrderByDataHoraAsc(
                        professora.getId(), dataHora, dataHora.plusMinutes(1)).stream()
                .anyMatch(item -> item.getAlunoId().equals(aluno.getId()));
        if (existe) return;
        SessaoAgendada sessao = new SessaoAgendada();
        sessao.setAlunoId(aluno.getId());
        sessao.setProfessorId(professora.getId());
        sessao.setDataHora(dataHora);
        sessoes.save(sessao);
    }
}
