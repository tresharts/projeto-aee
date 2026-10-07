package com.art.aee.atendimento;

import com.art.aee.atendimento.dto.AtendimentoRequest;
import com.art.aee.atendimento.dto.AtendimentoResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/atendimentos")
public class AtendimentoController {

    private final AtendimentoService atendimentoService;

    public AtendimentoController(AtendimentoService atendimentoService) {
        this.atendimentoService = atendimentoService;
    }

    @GetMapping
    public ResponseEntity<Page<AtendimentoResponse>> listar(
            @RequestParam(value = "alunoId", required = false) UUID alunoId,
            @RequestParam(value = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(value = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @PageableDefault(page = 0, size = 10, sort = "dataHora", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<AtendimentoResponse> atendimentos = atendimentoService.listar(pageable, alunoId, inicio, fim);
        return ResponseEntity.ok(atendimentos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtendimentoResponse> buscarPorId(@PathVariable UUID id) {
        AtendimentoResponse atendimento = atendimentoService.buscarPorId(id);
        return ResponseEntity.ok(atendimento);
    }

    @PostMapping
    public ResponseEntity<AtendimentoResponse> criar(@Valid @RequestBody AtendimentoRequest request) {
        AtendimentoResponse atendimentoCriado = atendimentoService.criar(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(atendimentoCriado.id())
                .toUri();

        return ResponseEntity.created(location).body(atendimentoCriado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtendimentoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody AtendimentoRequest request) {

        AtendimentoResponse atendimentoAtualizado = atendimentoService.atualizar(id, request);
        return ResponseEntity.ok(atendimentoAtualizado);
    }
}
