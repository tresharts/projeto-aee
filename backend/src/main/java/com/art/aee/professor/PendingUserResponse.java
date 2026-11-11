package com.art.aee.professor;

import java.util.UUID;

public record PendingUserResponse(UUID id, String name, String email) {
    public static PendingUserResponse from(Professor professor) {
        return new PendingUserResponse(professor.getId(), professor.getName(), professor.getEmail());
    }
}
