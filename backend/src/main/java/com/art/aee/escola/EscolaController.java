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

@RestController
@RequestMapping("/api/escolas")
public class EscolaController {

    private final EscolaService escolaService;

    public EscolaController(EscolaService escolaService) {
        this.escolaService = escolaService;
    }

    @GetMapping
    public ResponseEntity<Page<EscolaResponse>> listar(
            @RequestParam(value = "nome", required = false) String nome,
            @PageableDefault(page = 0, size = 10, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<EscolaResponse> escolas = escolaService.listar(pageable, nome);
        return ResponseEntity.ok(escolas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EscolaResponse> buscarPorId(@PathVariable UUID id) {
        EscolaResponse escola = escolaService.buscarPorId(id);
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
            @PathVariable UUID id,
            @Valid @RequestBody EscolaRequest request) {

        EscolaResponse escolaAtualizada = escolaService.atualizar(id, request);
        return ResponseEntity.ok(escolaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        escolaService.remover(id);

        return ResponseEntity.noContent().build();
    }
}
