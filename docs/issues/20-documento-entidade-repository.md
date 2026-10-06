# [Documento] Criar entidade Documento + Repository

## Descrição
Criar a entidade JPA `Documento` e seu repositório. O Documento representa o metadado de um arquivo (laudo, PEI) cujo conteúdo fica no MinIO. É o que alimenta a Aba 3 (Laudos e Documentos) do Prontuário.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/documento/TipoDocumento.java`
- `backend/src/main/java/com/art/aee/documento/Documento.java`
- `backend/src/main/java/com/art/aee/documento/DocumentoRepository.java`

## Detalhes técnicos

### TipoDocumento
```java
public enum TipoDocumento {
    LAUDO,
    PEI,
    OUTRO
}
```

### Entidade Documento
| Campo | Tipo | Validação |
|---|---|---|
| `id` | UUID | auto-gerado |
| `alunoId` | UUID | obrigatório |
| `nomeArquivo` | String | obrigatório (nome original) |
| `tipoConteudo` | String | obrigatório (ex: application/pdf) |
| `tamanhoBytes` | Long | obrigatório |
| `chaveMinio` | String | obrigatória, única |
| `tipoDocumento` | TipoDocumento (enum STRING) | obrigatório |
| `dataUpload` | LocalDateTime | auto-gerado (`@CreationTimestamp`) |

### Repository
- Estender `JpaRepository<Documento, UUID>`
- `Page<Documento> findByAlunoId(UUID alunoId, Pageable pageable)`
- `Page<Documento> findByAlunoIdAndTipoDocumento(UUID alunoId, TipoDocumento tipo, Pageable pageable)`

## Critérios de aceite
- [ ] Entidade mapeada com Bean Validation
- [ ] `chaveMinio` com constraint única
- [ ] Repository paginado (`Page`)

## Dependências
- Nenhuma (usa MinIO só no service, issue #21)
