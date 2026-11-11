package com.art.aee.exception;

public class ContaPendenteException extends RuntimeException {
    public ContaPendenteException() {
        super("Cadastro aguardando aprovação da coordenação");
    }
}
