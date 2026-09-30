package com.art.aee.auth;

public record RefreshResponse(
        String accessToken,
        String refreshToken
) {}
