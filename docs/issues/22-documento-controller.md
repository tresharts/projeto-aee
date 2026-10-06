# [Documento] Implementar DocumentoController

## Descrição
Criar o controller REST do Documento, com upload multipart e download de arquivos.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/documento/DocumentoController.java`

## Detalhes técnicos

### Endpoints

| Método | Path | Descrição |
|---|---|---|
| POST | `/api/documentos/upload` | Upload (multipart: `arquivo`, `alunoId`, `tipo`) |
| GET | `/api/documentos` | Listar (paginado, filtros: aluno, tipo) |
| GET | `/api/documentos/{id}/download` | Download (bytes + content-type + nome) |
| DELETE | `/api/documentos/{id}` | Remover (204) |

### Detalhes
- Upload: `@RequestParam MultipartFile arquivo`, `@RequestParam UUID alunoId`, `@RequestParam TipoDocumento tipo` → `201 Created`
- Download: `ResponseEntity<InputStreamResource>` com `Content-Type` do arquivo e `Content-Disposition: attachment; filename="..."`
- Listar: `alunoId` (opcional), `tipo` (opcional, enum), `page`/`size` (default 10)/`sort` (default dataUpload,desc)

### Exemplo
```
POST /api/documentos/upload (multipart)
GET /api/documentos?alunoId=uuid&tipo=LAUDO
```

## Critérios de aceite
- [ ] Upload funciona via Postman/curl (PDF e imagem)
- [ ] Download retorna o arquivo íntegro
- [ ] Filtros funcionando
- [ ] Erros via handler global

## Dependências
- Issue #21
