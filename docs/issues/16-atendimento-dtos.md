# [Atendimento] Criar DTOs AtendimentoRequest e AtendimentoResponse

## Descrição
Criar os DTOs (records) para transferência de dados do Atendimento.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/atendimento/dto/AtendimentoRequest.java`
- `backend/src/main/java/com/art/aee/atendimento/dto/AtendimentoResponse.java`

## Detalhes técnicos

### AtendimentoRequest
```java
public record AtendimentoRequest(
    @NotNull(message = "Aluno é obrigatório")
    UUID alunoId,

    UUID professorId,

    @NotNull(message = "Data e hora são obrigatórias")
    @PastOrPresent(message = "Data e hora não podem ser futuras")
    LocalDateTime dataHora,

    Humor humor,

    Foco foco,

    String observacoes,

    @NotNull(message = "Presença é obrigatória")
    Boolean presente
) {}
```

### AtendimentoResponse
```java
public record AtendimentoResponse(
    UUID id,
    UUID alunoId,
    String nomeAluno,
    UUID professorId,
    LocalDateTime dataHora,
    Humor humor,
    Foco foco,
    String observacoes,
    boolean presente,
    LocalDateTime dataCadastro
) {}
```

## Critérios de aceite
- [ ] Records com validações Bean Validation
- [ ] Mensagens de erro em português
- [ ] `humor`/`foco` opcionais (registro de falta não tem esses campos)
- [ ] Response inclui `nomeAluno` (dado relacionado)

## Dependências
- Issue #15
