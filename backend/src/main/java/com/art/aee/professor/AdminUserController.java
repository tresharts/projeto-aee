package com.art.aee.professor;

import com.art.aee.auth.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUserController {
    private final AuthService authService;

    public AdminUserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/pendentes")
    public List<PendingUserResponse> pendingUsers(@AuthenticationPrincipal Professor admin) {
        return authService.listPending(admin.getEscolaId()).stream().map(PendingUserResponse::from).toList();
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<Void> approve(@AuthenticationPrincipal Professor admin, @PathVariable UUID id) {
        authService.approve(admin.getEscolaId(), id);
        return ResponseEntity.noContent().build();
    }
}
