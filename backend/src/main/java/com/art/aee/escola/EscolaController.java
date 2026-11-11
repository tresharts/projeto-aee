package com.art.aee.escola;

import com.art.aee.escola.dto.EscolaRequest;
import com.art.aee.escola.dto.EscolaResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.art.aee.professor.Professor;

@RestController
@RequestMapping("/api/escolas")
public class EscolaController {

    private final EscolaService escolaService;

    public EscolaController(EscolaService escolaService) {
        this.escolaService = escolaService;
    }

    @GetMapping
    public ResponseEntity<Page<EscolaResponse>> listar(
            @AuthenticationPrincipal Professor professor,
            @RequestParam(value = "nome", required = false) String nome,
            @PageableDefault(page = 0, size = 10, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<EscolaResponse> escolas = escolaService.listar(pageable, nome, professor.getEscolaId());
        return ResponseEntity.ok(escolas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EscolaResponse> buscarPorId(@AuthenticationPrincipal Professor professor, @PathVariable UUID id) {
        EscolaResponse escola = escolaService.buscarPorId(id, professor.getEscolaId());
        return ResponseEntity.ok(escola);
    }

    @PostMapping
    public ResponseEntity<EscolaResponse> criar(@Valid @RequestBody EscolaRequest request) {
        EscolaResponse escolaCriada = escolaService.criar(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(escolaCriada.id())
                .toUri();

        return ResponseEntity.created(location).body(escolaCriada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EscolaResponse> atualizar(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID id,
            @Valid @RequestBody EscolaRequest request) {

        EscolaResponse escolaAtualizada = escolaService.atualizar(id, request, professor.getEscolaId());
        return ResponseEntity.ok(escolaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@AuthenticationPrincipal Professor professor, @PathVariable UUID id) {
        escolaService.remover(id, professor.getEscolaId());

        return ResponseEntity.noContent().build();
    }
}
