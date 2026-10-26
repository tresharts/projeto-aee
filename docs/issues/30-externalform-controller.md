# [ExternalForm] Implementar Controller público

## Descrição
Criar o controller REST do External Form. Diferente dos outros, parte dele é **pública** (sem senha), pois é o link que o professor da escola regular acessa pelo WhatsApp.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/externalform/ExternalFormController.java`

## Detalhes técnicos

### Endpoints

| Método | Path | Descrição | Autenticação |
|---|---|---|---|
| POST | `/api/external-form/generate` | Gerar link seguro (token) | Bearer (AEE) |
| POST | `/api/external-form/{token}/submit` | Escola submete respostas | Pública |
| GET | `/api/external-form/{token}` | Verificar se link é válido | Pública |

### Parâmetros
- `POST /generate` — body: `{ "alunoId": "uuid", "perguntas": ["Pergunta 1", "Pergunta 2"] }`
- `POST /{token}/submit` — body: `{ "respostas": ["Resposta 1", "Resposta 2"] }`
- `GET /{token}` — retorna se o link existe e está ativo

### Respostas
- `201 Created` — link gerado com token
- `200 OK` — resposta submetida / link válido
- `404 Not Found` — token inválido
- `409 Conflict` — link já usado (ativa = false)

### Observações
- Endpoint público sem `Bearer` (acesso via celular da escola regular)
- Rate limiting simples não entra no MVP

## Critérios de aceite
- [ ] Geração protegida (Bearer)
- [ ] Submissão pública sem autenticação
- [ ] Validação de token (expirado/inexistente → 404)
- [ ] Erros via `GlobalExceptionHandler`

## Dependências
- Issue #29 (ExternalFormService)
