package com.art.aee.turma;

import com.art.aee.turma.dto.TurmaRequest;
import com.art.aee.turma.dto.TurmaResponse;
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
@RequestMapping("/api/turmas")
public class TurmaController {

    private final TurmaService turmaService;

    public TurmaController(TurmaService turmaService) {
        this.turmaService = turmaService;
    }

    @GetMapping
    public ResponseEntity<Page<TurmaResponse>> listar(
            @RequestParam(value = "escolaId", required = false) UUID escolaId,
            @RequestParam(value = "nome", required = false) String nome,
            @PageableDefault(page = 0, size = 10, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<TurmaResponse> turmas = turmaService.listar(pageable, escolaId, nome);
        return ResponseEntity.ok(turmas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurmaResponse> buscarPorId(@PathVariable UUID id) {
        TurmaResponse turma = turmaService.buscarPorId(id);
        return ResponseEntity.ok(turma);
    }

    @PostMapping
    public ResponseEntity<TurmaResponse> criar(@Valid @RequestBody TurmaRequest request) {
        TurmaResponse turmaCriada = turmaService.criar(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(turmaCriada.id())
                .toUri();

        return ResponseEntity.created(location).body(turmaCriada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurmaResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody TurmaRequest request) {

        TurmaResponse turmaAtualizada = turmaService.atualizar(id, request);
        return ResponseEntity.ok(turmaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        turmaService.remover(id);

        return ResponseEntity.noContent().build();
    }
}
