package com.art.aee.auth;

public record AuthResponse(
        String accessToken,
        String name,
        String email,
        String role
) {}
