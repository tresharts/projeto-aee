package com.art.aee.auth;

public record LoginResult(AuthResponse response, String refreshToken) {}
