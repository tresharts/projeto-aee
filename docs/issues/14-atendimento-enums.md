# [Atendimento] Criar enums Humor e Foco

## Descrição
Criar os enums usados no registro de atendimento (check-in), correspondendo aos botões de clique único da tela.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/atendimento/Humor.java`
- `backend/src/main/java/com/art/aee/atendimento/Foco.java`

## Detalhes técnicos

### Humor
```java
public enum Humor {
    CALMO,
    AGITADO,
    APATICO
}
```

### Foco
```java
public enum Foco {
    ALTO,
    MEDIO,
    BAIXO
}
```

## Critérios de aceite
- [ ] Enums criados com os valores exatos (nomes em maiúsculas, sem acento)
- [ ] Serialização/desserialização JSON funciona nos DTOs

## Dependências
- Nenhuma
