package com.art.aee.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;

public record RefreshResponse(String accessToken, @JsonIgnore String refreshToken,
                              String name, String email, String role) {}
