# [Dashboard] Implementar Controller GET /api/dashboard

## Descrição
Criar o controller REST do Dashboard, expondo o endpoint de agregação do Centro de Comando. Endpoint protegido por autenticação (Bearer token).

## Arquivos a criar
- `backend/src/main/java/com/art/aee/dashboard/DashboardController.java`

## Detalhes técnicos

### Endpoint

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/dashboard` | Retorna DashboardResponse (agenda, alertas, feed) |

### Parâmetros de consulta
Nenhum obrigatório. O professor logado é identificado pelo JWT.

### Respostas
- `200 OK` — sucesso com `DashboardResponse`
- `401 Unauthorized` — não autenticado
- `500 Internal Server Error` — erro inesperado (via GlobalExceptionHandler)

### Exemplo de requisição
```
GET /api/dashboard
Authorization: Bearer <token>
```

### Exemplo de resposta
```json
{
  "agendaDoDia": [
    {
      "alunoId": "uuid",
      "nomeAluno": "João Silva",
      "nomeTurma": "Turma A",
      "nomeEscola": "Escola Municipal",
      "dataHora": "2026-09-30T14:30:00",
      "presente": true,
      "humor": "CALMO",
      "foco": "ALTO"
    }
  ],
  "alertas": [
    {
      "id": "uuid",
      "tipo": "FALTAS_ACUMULADAS",
      "mensagem": "João faltou 3 vezes",
      "severidade": "VERMELHO"
    },
    {
      "id": "uuid",
      "tipo": "PEI_VENCENDO",
      "mensagem": "PEI da Maria vence em 15 dias",
      "severidade": "LARANJA"
    }
  ],
  "feedRetornos": [
    {
      "id": "uuid",
      "nomeProfessorEscola": "Ana Paula",
      "escola": "Escola Municipal",
      "mensagem": "A criança participou bem esta semana.",
      "dataEnvio": "2026-09-29T10:15:00"
    }
  ]
}
```

## Critérios de aceite
- [ ] Endpoint implementado no padrão (`Bearer token`, `200 OK`)
- [ ] Agregação correta de agenda, alertas e feed
- [ ] Erros via `GlobalExceptionHandler`
- [ ] Sem comentários no código

## Dependências
- Issue #26 (DashboardService)
