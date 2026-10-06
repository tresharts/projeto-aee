# [Atendimento] Implementar AtendimentoController

## Descrição
Criar o controller REST do Atendimento, mesmo molde dos controllers de Aluno/Escola/Turma.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/atendimento/AtendimentoController.java`

## Detalhes técnicos

### Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/atendimentos` | Listar (paginado, filtros: aluno, período) |
| GET | `/api/atendimentos/{id}` | Buscar por ID |
| POST | `/api/atendimentos` | Criar (201 + Location) |
| PUT | `/api/atendimentos/{id}` | Atualizar (200) |

Sem DELETE (histórico não se apaga).

### Parâmetros de consulta (GET /api/atendimentos)
- `alunoId` (opcional): UUID do aluno (alimenta a Linha do Tempo)
- `inicio` (opcional): `LocalDateTime` (ISO-8601) início do período
- `fim` (opcional): `LocalDateTime` (ISO-8601) fim do período
- `page` (default 0), `size` (default 10), `sort` (default dataHora,desc): ordenação cronológica reversa

### Exemplo
```
GET /api/atendimentos?alunoId=uuid&inicio=2026-01-01T00:00&fim=2026-06-30T23:59&page=0&size=10
```

## Critérios de aceite
- [ ] Endpoints implementados no padrão (`201 + Location`, validações `@Valid`)
- [ ] Filtros por aluno e período funcionando (isolados e combinados)
- [ ] Ordenação padrão cronológica reversa
- [ ] Erros via handler global

## Dependências
- Issue #17
