package com.art.aee.auth;

import com.art.aee.professor.Professor;
import com.art.aee.professor.ProfessorRepository;
import com.art.aee.professor.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final ProfessorRepository professorRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            ProfessorRepository professorRepository,
            RefreshTokenRepository refreshTokenRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder) {
        this.professorRepository = professorRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Professor professor = professorRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        if (!passwordEncoder.matches(request.password(), professor.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }

        String accessToken = tokenService.generateAccessToken(professor);
        RefreshToken refreshToken = tokenService.generateRefreshToken(professor);
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                professor.getName(),
                professor.getEmail()
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (professorRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Professor professor = Professor.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.PROFESSOR)
                .build();

        professorRepository.save(professor);

        String accessToken = tokenService.generateAccessToken(professor);
        RefreshToken refreshToken = tokenService.generateRefreshToken(professor);
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                professor.getName(),
                professor.getEmail()
        );
    }

    @Transactional
    public RefreshResponse refresh(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token inválido"));

        if (!tokenService.isRefreshTokenValid(token)) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token expirado");
        }

        refreshTokenRepository.delete(token);
        RefreshToken newToken = tokenService.generateRefreshToken(token.getProfessor());
        refreshTokenRepository.save(newToken);

        String accessToken = tokenService.generateAccessToken(token.getProfessor());
        return new RefreshResponse(accessToken, newToken.getToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenRepository.findByToken(refreshToken)
                    .ifPresent(refreshTokenRepository::delete);
        }
    }
}
