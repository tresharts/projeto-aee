package com.art.aee.sessao;

import com.art.aee.professor.Professor;
import com.art.aee.sessao.dto.SessaoRequest;
import com.art.aee.sessao.dto.SessaoResponse;
import com.art.aee.sessao.dto.SessaoStatusRequest;
import com.art.aee.sessao.dto.FaltaConsecutivaResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessoes")
public class SessaoAgendadaController {

    private final SessaoAgendadaService sessaoService;

    public SessaoAgendadaController(SessaoAgendadaService sessaoService) {
        this.sessaoService = sessaoService;
    }

    @GetMapping
    public ResponseEntity<List<SessaoResponse>> listar(
            @AuthenticationPrincipal Professor professor,
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(sessaoService.listar(inicio, fim, professor));
    }

    @GetMapping("/alertas/faltas-consecutivas")
    public ResponseEntity<List<FaltaConsecutivaResponse>> listarAlertasDeFaltas(
            @AuthenticationPrincipal Professor professor) {
        return ResponseEntity.ok(sessaoService.listarAlertasDeFaltas(professor));
    }

    @PostMapping
    public ResponseEntity<SessaoResponse> criar(
            @AuthenticationPrincipal Professor professor,
            @Valid @RequestBody SessaoRequest request) {
        return ResponseEntity.ok(sessaoService.criar(request, professor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessaoResponse> atualizar(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID id,
            @Valid @RequestBody SessaoRequest request) {
        return ResponseEntity.ok(sessaoService.atualizar(id, request, professor));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SessaoResponse> atualizarStatus(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID id,
            @Valid @RequestBody SessaoStatusRequest request) {
        return ResponseEntity.ok(sessaoService.atualizarStatus(id, request.status(), professor));
    }

    @PutMapping("/{id}/atendimento/{atendimentoId}")
    public ResponseEntity<SessaoResponse> vincularAtendimento(
            @AuthenticationPrincipal Professor professor,
            @PathVariable UUID id,
            @PathVariable UUID atendimentoId) {
        return ResponseEntity.ok(sessaoService.vincularAtendimento(id, atendimentoId, professor));
    }
}
