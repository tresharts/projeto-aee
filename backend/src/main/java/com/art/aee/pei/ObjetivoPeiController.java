package com.art.aee.pei;

import com.art.aee.pei.dto.ObjetivoPeiRequest;
import com.art.aee.pei.dto.ObjetivoPeiResponse;
import com.art.aee.professor.Professor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alunos/{alunoId}/objetivos-pei")
public class ObjetivoPeiController {

    private final ObjetivoPeiService objetivoPeiService;

    public ObjetivoPeiController(ObjetivoPeiService objetivoPeiService) {
        this.objetivoPeiService = objetivoPeiService;
    }

    @GetMapping
    public ResponseEntity<List<ObjetivoPeiResponse>> listar(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID alunoId,
            @RequestParam(defaultValue = "false") boolean incluirInativos) {
        return ResponseEntity.ok(objetivoPeiService.listar(alunoId, professor.getEscolaId(), incluirInativos));
    }

    @PostMapping
    public ResponseEntity<ObjetivoPeiResponse> criar(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID alunoId,
            @Valid @RequestBody ObjetivoPeiRequest request) {
        ObjetivoPeiResponse salvo = objetivoPeiService.criar(alunoId, request, professor.getEscolaId());
        var location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{objetivoId}")
                .buildAndExpand(salvo.id())
                .toUri();
        return ResponseEntity.created(location).body(salvo);
    }

    @PutMapping("/{objetivoId}")
    public ResponseEntity<ObjetivoPeiResponse> atualizar(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID alunoId,
            @PathVariable UUID objetivoId,
            @Valid @RequestBody ObjetivoPeiRequest request) {
        return ResponseEntity.ok(objetivoPeiService.atualizar(alunoId, objetivoId, request, professor.getEscolaId()));
    }

    @DeleteMapping("/{objetivoId}")
    public ResponseEntity<Void> desativar(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID alunoId,
            @PathVariable UUID objetivoId) {
        objetivoPeiService.desativar(alunoId, objetivoId, professor.getEscolaId());
        return ResponseEntity.noContent().build();
    }
}
