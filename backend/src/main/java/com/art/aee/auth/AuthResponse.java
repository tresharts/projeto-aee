package com.art.aee.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String name,
        String email
) {}
