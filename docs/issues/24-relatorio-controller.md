# [Relatorio] Implementar RelatorioController

## Descrição
Criar o controller que expõe a geração do PDF consolidado do aluno.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/relatorio/RelatorioController.java`

## Detalhes técnicos

### Endpoint

| Método | Path | Descrição |
|---|---|---|
| POST | `/api/relatorios/alunos/{alunoId}` | Gera PDF (query params `inicio`, `fim` opcionais, ISO-8601) |

POST (não GET) porque a geração tem custo e o período vai no corpo/query de forma explícita; resposta com `Content-Type: application/pdf` e `Content-Disposition: attachment; filename="relatorio-{nome}-{periodo}.pdf"`.

### Exemplo
```
POST /api/relatorios/alunos/uuid?inicio=2026-01-01T00:00&fim=2026-06-30T23:59
→ application/pdf (bytes)
```

## Critérios de aceite
- [ ] Retorna PDF com content-type e nome de arquivo corretos
- [ ] Período opcional (default: últimos 6 meses)
- [ ] 404 para aluno inexistente via handler global

## Dependências
- Issue #23
