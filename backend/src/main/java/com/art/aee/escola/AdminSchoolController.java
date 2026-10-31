package com.art.aee.escola;

import com.art.aee.escola.dto.EscolaAccessCodeResponse;
import com.art.aee.professor.Professor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/escola")
public class AdminSchoolController {
    private final EscolaService escolaService;

    public AdminSchoolController(EscolaService escolaService) {
        this.escolaService = escolaService;
    }

    @GetMapping("/codigo-cadastro")
    public EscolaAccessCodeResponse getRegistrationCode(@AuthenticationPrincipal Professor admin) {
        return escolaService.buscarCodigoCadastro(admin.getEscolaId());
    }
}
