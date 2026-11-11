package com.art.aee.formulario;

import com.art.aee.aluno.Aluno;
import com.art.aee.aluno.AlunoRepository;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.RecursoNaoEncontradoException;
import com.art.aee.formulario.dto.FormularioGerarRequest;
import com.art.aee.formulario.dto.FormularioPublicoResponse;
import com.art.aee.formulario.dto.FormularioRespostaRequest;
import com.art.aee.professor.Professor;
import com.art.aee.turma.TurmaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FormularioExternoService {

    private static final int VALIDADE_EM_HORAS = 24;

    private final FormularioExternoRepository formularioRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;

    public FormularioExternoService(
            FormularioExternoRepository formularioRepository,
            AlunoRepository alunoRepository,
            TurmaRepository turmaRepository) {
        this.formularioRepository = formularioRepository;
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
    }

    @Transactional
    public String gerar(FormularioGerarRequest request, Professor professor) {
        if (professor.getEscolaId() == null) {
            throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        }
        Aluno aluno = alunoRepository.findById(request.alunoId())
                .filter(item -> turmaRepository.existsByIdAndEscolaId(item.getTurmaId(), professor.getEscolaId()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado"));
        if (!aluno.isAtivo()) throw new ConflitoException("Não é possível gerar um formulário para um aluno inativo.");

        List<String> perguntas = request.perguntas().stream()
                .map(String::trim)
                .filter(pergunta -> !pergunta.isBlank())
                .toList();
        if (perguntas.isEmpty()) throw new IllegalArgumentException("Adicione pelo menos uma pergunta.");

        FormularioExterno formulario = FormularioExterno.builder()
                .alunoId(aluno.getId())
                .professorId(professor.getId())
                .token(UUID.randomUUID().toString())
                .perguntas(perguntas)
                .build();
        return formularioRepository.save(formulario).getToken();
    }

    @Transactional(readOnly = true)
    public FormularioPublicoResponse buscar(String token) {
        FormularioExterno formulario = buscarFormulario(token);
        Aluno aluno = alunoRepository.findById(formulario.getAlunoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Formulário não encontrado"));
        if (formulario.getDataResposta() != null) {
            return new FormularioPublicoResponse(aluno.getNome(), List.of(), "RESPONDIDO");
        }
        if (expirou(formulario)) {
            return new FormularioPublicoResponse(aluno.getNome(), List.of(), "EXPIRADO");
        }
        return new FormularioPublicoResponse(aluno.getNome(), formulario.getPerguntas(), "DISPONIVEL");
    }

    @Transactional
    public void responder(String token, FormularioRespostaRequest request) {
        FormularioExterno formulario = buscarFormulario(token);
        if (formulario.getDataResposta() != null) {
            throw new ConflitoException("Este formulário já foi respondido.");
        }
        if (expirou(formulario)) {
            throw new ConflitoException("O prazo de 24 horas para responder este formulário terminou.");
        }
        if (request.respostas().size() != formulario.getPerguntas().size()) {
            throw new IllegalArgumentException("A quantidade de respostas não corresponde às perguntas do formulário.");
        }
        formulario.setRespostas(request.respostas().stream().map(String::trim).toList());
        formulario.setDataResposta(LocalDateTime.now());
        formularioRepository.save(formulario);
    }

    private FormularioExterno buscarFormulario(String token) {
        return formularioRepository.findByToken(token)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Formulário não encontrado"));
    }

    private boolean expirou(FormularioExterno formulario) {
        return !LocalDateTime.now().isBefore(formulario.getDataCadastro().plusHours(VALIDADE_EM_HORAS));
    }
}
