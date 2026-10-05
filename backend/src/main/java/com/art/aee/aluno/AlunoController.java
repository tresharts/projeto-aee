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
            @RequestParam(value = "escolaId", required = false) UUID escolaId,
            @RequestParam(value = "nome", required = false) String nome,
            @PageableDefault(page = 0, size = 6, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<AlunoResponse> alunos = alunoService.listar(pageable, escolaId, nome);
        return ResponseEntity.ok(alunos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlunoResponse> buscarPorId(@PathVariable UUID id) {
        AlunoResponse aluno = alunoService.buscarPorId(id);
        return ResponseEntity.ok(aluno);
    }

    @PostMapping
    public ResponseEntity<AlunoResponse> criar(@Valid @RequestBody AlunoRequest request) {
        AlunoResponse alunoCriado = alunoService.criar(request);


        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(alunoCriado.id())
                .toUri();

        return ResponseEntity.created(location).body(alunoCriado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlunoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody AlunoRequest request) {

        AlunoResponse alunoAtualizado = alunoService.atualizar(id, request);
        return ResponseEntity.ok(alunoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        alunoService.desativar(id);

        return ResponseEntity.noContent().build();
    }
}