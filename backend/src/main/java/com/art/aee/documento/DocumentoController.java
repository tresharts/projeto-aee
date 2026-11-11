package com.art.aee.documento;

import com.art.aee.documento.dto.DocumentoResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.io.InputStream;
import java.util.UUID;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentoResponse> upload(
            @RequestParam MultipartFile arquivo,
            @RequestParam UUID alunoId,
            @RequestParam TipoDocumento tipo) {

        DocumentoResponse salvo = documentoService.upload(arquivo, alunoId, tipo);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}/download")
                .buildAndExpand(salvo.id())
                .toUri();

        return ResponseEntity.created(location).body(salvo);
    }

    @GetMapping
    public ResponseEntity<Page<DocumentoResponse>> listar(
            @RequestParam(value = "alunoId", required = false) UUID alunoId,
            @RequestParam(value = "tipo", required = false) TipoDocumento tipo,
            @PageableDefault(page = 0, size = 10, sort = "dataUpload", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<DocumentoResponse> documentos = documentoService.listar(pageable, alunoId, tipo);
        return ResponseEntity.ok(documentos);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable UUID id) {
        DocumentoResponse meta = documentoService.buscarPorId(id);
        InputStream stream = documentoService.download(id);

        InputStreamResource resource = new InputStreamResource(stream);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(meta.tipoConteudo()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.nomeArquivo() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        documentoService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
