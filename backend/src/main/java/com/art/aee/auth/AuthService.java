package com.art.aee.auth;

import com.art.aee.professor.Professor;
import com.art.aee.professor.ProfessorRepository;
import com.art.aee.professor.Role;
import com.art.aee.professor.AccountStatus;
import com.art.aee.escola.EscolaRepository;
import com.art.aee.exception.ContaPendenteException;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.CredenciaisInvalidasException;
import com.art.aee.exception.RecursoNaoEncontradoException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final ProfessorRepository professorRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final EscolaRepository escolaRepository;

    public AuthService(
            ProfessorRepository professorRepository,
            RefreshTokenRepository refreshTokenRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder,
            EscolaRepository escolaRepository) {
        this.professorRepository = professorRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.escolaRepository = escolaRepository;
    }

    @Transactional
    public LoginResult login(LoginRequest request) {
        Professor professor = professorRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(CredenciaisInvalidasException::new);

        if (!passwordEncoder.matches(request.password(), professor.getPassword())) {
            throw new CredenciaisInvalidasException();
        }

        if (professor.getRole() != Role.ADMIN && professor.getAccountStatus() != AccountStatus.APPROVED) {
            throw new ContaPendenteException();
        }

        String accessToken = tokenService.generateAccessToken(professor);
        RefreshToken refreshToken = tokenService.generateRefreshToken(professor);
        refreshTokenRepository.save(refreshToken);

        return new LoginResult(new AuthResponse(accessToken, professor.getName(),
                professor.getEmail(), professor.getRole().name()), refreshToken.getToken());
    }

    @Transactional
    public RegistrationResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (professorRepository.findByEmail(email).isPresent()) {
            throw new ConflitoException("Este e-mail já possui cadastro");
        }

        String codigoEscola = request.codigoEscola().trim().toUpperCase();
        var escola = escolaRepository.findByCodigoCadastro(codigoEscola)
                .orElseThrow(() -> new ConflitoException("Código da escola inválido. Confira com a coordenação."));

        Professor professor = Professor.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.PROFESSOR)
                .accountStatus(AccountStatus.PENDING)
                .escolaId(escola.getId())
                .build();

        professorRepository.save(professor);
        return new RegistrationResponse("Cadastro recebido. Aguarde a aprovação da coordenação.");
    }

    @Transactional
    public RefreshResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new CredenciaisInvalidasException();
        }
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(CredenciaisInvalidasException::new);

        if (!tokenService.isRefreshTokenValid(token)) {
            refreshTokenRepository.delete(token);
            throw new CredenciaisInvalidasException();
        }

        Professor professor = token.getProfessor();
        if (professor.getRole() != Role.ADMIN && professor.getAccountStatus() != AccountStatus.APPROVED) {
            refreshTokenRepository.delete(token);
            throw new ContaPendenteException();
        }

        refreshTokenRepository.delete(token);
        RefreshToken newToken = tokenService.generateRefreshToken(professor);
        refreshTokenRepository.save(newToken);

        String accessToken = tokenService.generateAccessToken(professor);
        return new RefreshResponse(accessToken, newToken.getToken(), professor.getName(),
                professor.getEmail(), professor.getRole().name());
    }

    @Transactional(readOnly = true)
    public java.util.List<Professor> listPending(java.util.UUID escolaId) {
        if (escolaId == null) throw new ConflitoException("A conta admin precisa estar vinculada a uma escola.");
        return professorRepository.findByAccountStatusAndRoleAndEscolaIdOrderByNameAsc(
                AccountStatus.PENDING, Role.PROFESSOR, escolaId);
    }

    @Transactional
    public void approve(java.util.UUID escolaId, java.util.UUID id) {
        if (escolaId == null) throw new ConflitoException("A conta admin precisa estar vinculada a uma escola.");
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        if (professor.getRole() != Role.PROFESSOR || !escolaId.equals(professor.getEscolaId())) {
            throw new RecursoNaoEncontradoException("Solicitação não encontrada nesta escola");
        }
        professor.setAccountStatus(AccountStatus.APPROVED);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenRepository.findByToken(refreshToken)
                    .ifPresent(refreshTokenRepository::delete);
        }
    }
}
