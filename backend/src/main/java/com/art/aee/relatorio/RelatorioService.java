package com.art.aee.relatorio;

import com.art.aee.aluno.AlunoRepository;
import com.art.aee.atendimento.AtendimentoRepository;
import com.art.aee.documento.DocumentoRepository;
import com.art.aee.exception.RecursoNaoEncontradoException;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class RelatorioService {

    private static final DateTimeFormatter DATA_HORA_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter PERIODO_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final AlunoRepository alunoRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final DocumentoRepository documentoRepository;

    public RelatorioService(
            AlunoRepository alunoRepository,
            AtendimentoRepository atendimentoRepository,
            DocumentoRepository documentoRepository) {
        this.alunoRepository = alunoRepository;
        this.atendimentoRepository = atendimentoRepository;
        this.documentoRepository = documentoRepository;
    }

    @Transactional(readOnly = true)
    public byte[] gerarRelatorioAluno(UUID alunoId, LocalDateTime inicio, LocalDateTime fim) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado"));

        LocalDateTime periodoInicio = inicio != null ? inicio : LocalDateTime.now().minusMonths(6);
        LocalDateTime periodoFim = fim != null ? fim : LocalDateTime.now();

        var atendimentos = atendimentoRepository.findByAlunoIdAndDataHoraBetween(
                alunoId, periodoInicio, periodoFim,
                PageRequest.of(0, 1000, Sort.by("dataHora").ascending())
        ).getContent();

        var documentos = documentoRepository.findByAlunoId(
                alunoId,
                PageRequest.of(0, 1000, Sort.by("dataUpload").descending())
        ).getContent();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            cabecalho(document, aluno, periodoInicio, periodoFim);
            secaoAtendimentos(document, atendimentos);
            secaoDocumentos(document, documentos);
            rodape(document);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do relatorio: " + e.getMessage(), e);
        }
    }

    private void cabecalho(Document document, com.art.aee.aluno.Aluno aluno, LocalDateTime inicio, LocalDateTime fim) throws Exception {
        Font tituloFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        Paragraph titulo = new Paragraph("Relatorio do Aluno", tituloFont);
        titulo.setAlignment(Element.ALIGN_CENTER);
        document.add(titulo);

        Paragraph info = new Paragraph(
                "Aluno: " + aluno.getNome() +
                        " | Turma: " + aluno.getTurmaId() +
                        " | Periodo: " + PERIODO_FORMAT.format(inicio) + " a " + PERIODO_FORMAT.format(fim)
        );
        info.setAlignment(Element.ALIGN_LEFT);
        document.add(info);

        Paragraph espaco = new Paragraph("\n");
        document.add(espaco);
    }

    private void secaoAtendimentos(Document document, java.util.List<com.art.aee.atendimento.Atendimento> atendimentos) throws Exception {
        Font secaoFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Paragraph secao = new Paragraph("Atendimentos", secaoFont);
        document.add(secao);

        if (atendimentos.isEmpty()) {
            document.add(new Paragraph("Nenhum atendimento no periodo."));
            document.add(new Paragraph("\n"));
            return;
        }

        PdfPTable tabela = new PdfPTable(5);
        tabela.setWidthPercentage(100);
        adicionarCabecalhoTabela(tabela, "Data", "Presenca", "Humor", "Foco", "Observacoes");

        for (var a : atendimentos) {
            tabela.addCell(a.getDataHora().format(DATA_HORA_FORMAT));
            tabela.addCell(Boolean.TRUE.equals(a.getPresente()) ? "Presente" : "Falta");
            tabela.addCell(a.getHumor() != null ? a.getHumor().name() : "-");
            tabela.addCell(a.getFoco() != null ? a.getFoco().name() : "-");
            tabela.addCell(a.getObservacoes() != null ? a.getObservacoes() : "-");
        }

        document.add(tabela);
        document.add(new Paragraph("\n"));
    }

    private void secaoDocumentos(Document document, java.util.List<com.art.aee.documento.Documento> documentos) throws Exception {
        Font secaoFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Paragraph secao = new Paragraph("Documentos", secaoFont);
        document.add(secao);

        if (documentos.isEmpty()) {
            document.add(new Paragraph("Nenhum documento cadastrado."));
            document.add(new Paragraph("\n"));
            return;
        }

        PdfPTable tabela = new PdfPTable(4);
        tabela.setWidthPercentage(100);
        adicionarCabecalhoTabela(tabela, "Nome do Arquivo", "Tipo", "Tipo de Conteudo", "Data de Upload");

        for (var d : documentos) {
            tabela.addCell(d.getNomeArquivo());
            tabela.addCell(d.getTipoDocumento().name());
            tabela.addCell(d.getTipoConteudo());
            tabela.addCell(d.getDataUpload().format(DATA_HORA_FORMAT));
        }

        document.add(tabela);
        document.add(new Paragraph("\n"));
    }

    private void rodape(Document document) throws Exception {
        Font rodapeFont = new Font(Font.HELVETICA, 8, Font.ITALIC);
        Paragraph rodape = new Paragraph("Gerado em: " + LocalDateTime.now().format(DATA_HORA_FORMAT), rodapeFont);
        rodape.setAlignment(Element.ALIGN_CENTER);
        document.add(rodape);
    }

    private void adicionarCabecalhoTabela(PdfPTable tabela, String... colunas) {
        Font fonteCabecalho = new Font(Font.HELVETICA, 9, Font.BOLD);
        for (String coluna : colunas) {
            PdfPCell celula = new PdfPCell(new Phrase(coluna, fonteCabecalho));
            celula.setHorizontalAlignment(Element.ALIGN_CENTER);
            tabela.addCell(celula);
        }
    }
}
