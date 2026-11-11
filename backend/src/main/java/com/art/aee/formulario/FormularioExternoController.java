package com.art.aee.formulario;

import com.art.aee.formulario.dto.FormularioGerarRequest;
import com.art.aee.formulario.dto.FormularioGerarResponse;
import com.art.aee.formulario.dto.FormularioPublicoResponse;
import com.art.aee.formulario.dto.FormularioRespostaRequest;
import com.art.aee.professor.Professor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/external-form")
public class FormularioExternoController {

    private final FormularioExternoService formularioService;

    public FormularioExternoController(FormularioExternoService formularioService) {
        this.formularioService = formularioService;
    }

    @GetMapping("/responses/recent")
    public ResponseEntity<List<RetornoRecenteResponse>> retornosRecentes(@AuthenticationPrincipal Professor professor) {
        return ResponseEntity.ok(formularioService.retornosRecentes(professor));
    }

    @PostMapping("/generate")
    public ResponseEntity<FormularioGerarResponse> gerar(
            @AuthenticationPrincipal Professor professor,
            @Valid @RequestBody FormularioGerarRequest request) {
        return ResponseEntity.ok(new FormularioGerarResponse(formularioService.gerar(request, professor)));
    }

    @GetMapping("/{token}")
    public ResponseEntity<FormularioPublicoResponse> buscar(@PathVariable String token) {
        return ResponseEntity.ok(formularioService.buscar(token));
    }

    @PostMapping("/{token}/submit")
    public ResponseEntity<Void> responder(
            @PathVariable String token,
            @Valid @RequestBody FormularioRespostaRequest request) {
        formularioService.responder(token, request);
        return ResponseEntity.noContent().build();
    }
}
