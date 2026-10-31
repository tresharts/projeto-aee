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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.art.aee.professor.Professor;

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
            @AuthenticationPrincipal Professor professor,
            @RequestParam(value = "escolaId", required = false) UUID escolaId,
            @RequestParam(value = "nome", required = false) String nome,
            @PageableDefault(page = 0, size = 10, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<TurmaResponse> turmas = turmaService.listar(pageable, escolaId, nome, professor.getEscolaId());
        return ResponseEntity.ok(turmas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurmaResponse> buscarPorId(@AuthenticationPrincipal Professor professor, @PathVariable UUID id) {
        TurmaResponse turma = turmaService.buscarPorId(id, professor.getEscolaId());
        return ResponseEntity.ok(turma);
    }

    @PostMapping
    public ResponseEntity<TurmaResponse> criar(@AuthenticationPrincipal Professor professor, @Valid @RequestBody TurmaRequest request) {
        TurmaResponse turmaCriada = turmaService.criar(request, professor.getEscolaId());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(turmaCriada.id())
                .toUri();

        return ResponseEntity.created(location).body(turmaCriada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurmaResponse> atualizar(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID id,
            @Valid @RequestBody TurmaRequest request) {

        TurmaResponse turmaAtualizada = turmaService.atualizar(id, request, professor.getEscolaId());
        return ResponseEntity.ok(turmaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@AuthenticationPrincipal Professor professor, @PathVariable UUID id) {
        turmaService.remover(id, professor.getEscolaId());

        return ResponseEntity.noContent().build();
    }
}
