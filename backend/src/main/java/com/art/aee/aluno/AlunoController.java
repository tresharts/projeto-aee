package com.art.aee.aluno;

import com.art.aee.aluno.dto.AlunoRequest;
import com.art.aee.aluno.dto.AlunoResponse;
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
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoService alunoService;

    public AlunoController(AlunoService alunoService) {
        this.alunoService = alunoService;
    }

    @GetMapping
    public ResponseEntity<Page<AlunoResponse>> listar(
            @AuthenticationPrincipal Professor professor,
            @RequestParam(value = "escolaId", required = false) UUID escolaId,
            @RequestParam(value = "nome", required = false) String nome,
            @PageableDefault(page = 0, size = 6, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<AlunoResponse> alunos = alunoService.listar(pageable, escolaId, nome, professor.getEscolaId());
        return ResponseEntity.ok(alunos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlunoResponse> buscarPorId(@AuthenticationPrincipal Professor professor, @PathVariable UUID id) {
        AlunoResponse aluno = alunoService.buscarPorId(id, professor.getEscolaId());
        return ResponseEntity.ok(aluno);
    }

    @PostMapping
    public ResponseEntity<AlunoResponse> criar(@AuthenticationPrincipal Professor professor, @Valid @RequestBody AlunoRequest request) {
        AlunoResponse alunoCriado = alunoService.criar(request, professor.getEscolaId());


        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(alunoCriado.id())
                .toUri();

        return ResponseEntity.created(location).body(alunoCriado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlunoResponse> atualizar(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID id,
            @Valid @RequestBody AlunoRequest request) {

        AlunoResponse alunoAtualizado = alunoService.atualizar(id, request, professor.getEscolaId());
        return ResponseEntity.ok(alunoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@AuthenticationPrincipal Professor professor, @PathVariable UUID id) {
        alunoService.desativar(id, professor.getEscolaId());

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativar(@AuthenticationPrincipal Professor professor, @PathVariable UUID id) {
        alunoService.ativar(id, professor.getEscolaId());

        return ResponseEntity.noContent().build();
    }
}
