package com.art.aee.relatorio;

import com.art.aee.aluno.Aluno;
import com.art.aee.aluno.AlunoRepository;
import com.art.aee.exception.RecursoNaoEncontradoException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/relatorios/alunos")
public class RelatorioController {

    private static final DateTimeFormatter PERIODO_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final RelatorioService relatorioService;
    private final AlunoRepository alunoRepository;

    public RelatorioController(RelatorioService relatorioService, AlunoRepository alunoRepository) {
        this.relatorioService = relatorioService;
        this.alunoRepository = alunoRepository;
    }

    @PostMapping(path = "/{alunoId}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<ByteArrayResource> gerarRelatorio(
            @PathVariable UUID alunoId,
            @RequestParam(value = "inicio", required = false) LocalDateTime inicio,
            @RequestParam(value = "fim", required = false) LocalDateTime fim) {

        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado"));

        byte[] pdf = relatorioService.gerarRelatorioAluno(alunoId, inicio, fim);

        String nomeArquivo = montarNomeArquivo(aluno.getNome(), inicio, fim);

        ByteArrayResource resource = new ByteArrayResource(pdf);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomeArquivo + "\"")
                .body(resource);
    }

    private String montarNomeArquivo(String nomeAluno, LocalDateTime inicio, LocalDateTime fim) {
        String nomeLimpo = nomeAluno.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_-]", "");
        String periodo = (inicio != null && fim != null)
                ? PERIODO_FORMAT.format(inicio) + "_a_" + PERIODO_FORMAT.format(fim)
                : "ultimos_6_meses";
        return "relatorio_" + nomeLimpo + "_" + periodo + ".pdf";
    }
}
