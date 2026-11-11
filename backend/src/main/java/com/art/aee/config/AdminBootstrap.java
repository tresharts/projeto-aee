package com.art.aee.config;

import com.art.aee.professor.AccountStatus;
import com.art.aee.professor.Professor;
import com.art.aee.professor.ProfessorRepository;
import com.art.aee.professor.Role;
import com.art.aee.escola.CodigoCadastroEscola;
import com.art.aee.escola.Escola;
import com.art.aee.escola.EscolaRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final ProfessorRepository professorRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final EscolaRepository escolaRepository;

    public AdminBootstrap(ProfessorRepository professorRepository,
                          PasswordEncoder passwordEncoder,
                          Environment environment,
                          EscolaRepository escolaRepository) {
        this.professorRepository = professorRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
        this.escolaRepository = escolaRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = environment.getProperty("ADMIN_EMAIL", "").trim().toLowerCase();
        String password = environment.getProperty("ADMIN_PASSWORD", "");
        String schoolName = environment.getProperty("ADMIN_SCHOOL_NAME", "").trim();
        if (email.isBlank() && password.isBlank() && schoolName.isBlank()) return;
        if (email.isBlank() || schoolName.isBlank()) {
            throw new IllegalStateException("Configure ADMIN_EMAIL e ADMIN_SCHOOL_NAME juntos.");
        }

        Escola school = escolaRepository.findByNomeIgnoreCase(schoolName)
                .orElseGet(() -> escolaRepository.save(Escola.builder()
                        .nome(schoolName)
                        .codigoCadastro(novoCodigoEscola())
                        .build()));
        if (school.getCodigoCadastro() == null) {
            school.setCodigoCadastro(novoCodigoEscola());
            escolaRepository.save(school);
        }

        // Na primeira migração do piloto, contas preexistentes ainda não têm escola.
        var unassigned = professorRepository.findByEscolaIdIsNull();
        for (Professor professor : unassigned) {
            professor.setEscolaId(school.getId());
        }
        professorRepository.saveAll(unassigned);

        var existing = professorRepository.findByEmail(email);
        if (existing.isPresent()) {
            if (existing.get().getRole() != Role.ADMIN) {
                throw new IllegalStateException("ADMIN_EMAIL já está associado a uma conta que não é admin.");
            }
            if (existing.get().getEscolaId() != null && !existing.get().getEscolaId().equals(school.getId())) {
                throw new IllegalStateException("A conta admin já está vinculada a outra escola.");
            }
            existing.get().setEscolaId(school.getId());
            professorRepository.save(existing.get());
            return;
        }
        if (password.length() < 12) {
            throw new IllegalStateException("ADMIN_PASSWORD precisa ter no mínimo 12 caracteres.");
        }

        String name = environment.getProperty("ADMIN_NAME", "Coordenação AEE");
        professorRepository.save(Professor.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.APPROVED)
                .escolaId(school.getId())
                .build());
    }

    private String novoCodigoEscola() {
        String code;
        do {
            code = CodigoCadastroEscola.gerar();
        } while (escolaRepository.existsByCodigoCadastro(code));
        return code;
    }
}
