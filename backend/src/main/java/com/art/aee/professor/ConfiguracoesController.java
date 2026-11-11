package com.art.aee.professor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/configuracoes/conta")
public class ConfiguracoesController {
    private final ProfessorRepository professores;

    public ConfiguracoesController(ProfessorRepository professores) {
        this.professores = professores;
    }

    @GetMapping
    public ContaResponse consultar(@AuthenticationPrincipal Professor usuario) {
        return new ContaResponse(usuario.getName(), usuario.getEmail(), usuario.getRole().name());
    }

    @PutMapping
    public ResponseEntity<ContaResponse> atualizar(@AuthenticationPrincipal Professor usuario,
                                                   @Valid @RequestBody AtualizarContaRequest request) {
        Professor conta = professores.findById(usuario.getId()).orElseThrow();
        conta.setName(request.nome().trim());
        professores.save(conta);
        return ResponseEntity.ok(new ContaResponse(conta.getName(), conta.getEmail(), conta.getRole().name()));
    }

    public record AtualizarContaRequest(@NotBlank @Size(max = 100) String nome) {}
    public record ContaResponse(String nome, String email, String perfil) {}
}
