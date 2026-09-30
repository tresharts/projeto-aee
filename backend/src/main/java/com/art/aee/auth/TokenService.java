package com.art.aee.auth;

import com.art.aee.professor.Professor;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    private static final String ISSUER = "aee-backend";
    private static final long EXPIRATION_MINUTES = 15;

    public String generateAccessToken(Professor professor) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(professor.getId().toString())
                    .withClaim("role", professor.getRole().name())
                    .withExpiresAt(generateExpiration())
                    .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new RuntimeException("Erro ao gerar access token", e);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    public RefreshToken generateRefreshToken(Professor professor) {
        return RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .professor(professor)
                .build();
    }

    public boolean isRefreshTokenValid(RefreshToken token) {
        return token != null && token.getExpiresAt().isAfter(Instant.now());
    }

    private Instant generateExpiration() {
        return Instant.now().plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES);
    }
}
