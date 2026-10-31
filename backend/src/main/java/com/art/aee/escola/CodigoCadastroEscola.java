package com.art.aee.escola;

import java.security.SecureRandom;

public final class CodigoCadastroEscola {
    private static final String ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private CodigoCadastroEscola() {}

    public static String gerar() {
        StringBuilder codigo = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            codigo.append(ALFABETO.charAt(RANDOM.nextInt(ALFABETO.length())));
        }
        return codigo.toString();
    }
}
