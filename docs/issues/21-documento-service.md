# [Documento] Criar DTOs + Mapper + Service (upload/download MinIO)

## Descrição
Criar DTOs, mapper e service do Documento, incluindo a integração com o MinIO para upload, download e remoção de arquivos.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/documento/dto/DocumentoResponse.java`
- `backend/src/main/java/com/art/aee/documento/DocumentoMapper.java`
- `backend/src/main/java/com/art/aee/documento/DocumentoService.java`

## Detalhes técnicos

### DocumentoResponse
```java
public record DocumentoResponse(
    UUID id,
    UUID alunoId,
    String nomeArquivo,
    String tipoConteudo,
    Long tamanhoBytes,
    TipoDocumento tipoDocumento,
    LocalDateTime dataUpload
) {}
```
Sem campo de upload (usa `MultipartFile` direto no controller/service).

### Dependências do Service
- `DocumentoRepository`, `AlunoRepository`, `MinioClient`, nome do bucket (`@Value`)

### Métodos

#### `upload(MultipartFile arquivo, UUID alunoId, TipoDocumento tipo)`
1. Validar aluno existe (`RecursoNaoEncontradoException`)
2. Validar arquivo não vazio (vazio → `ConflitoException`? Não — validação de entrada: lançar `IllegalArgumentException` com mensagem clara, mapeada para 400 no handler)
3. Gerar chave `alunos/{alunoId}/{uuid}-{nomeOriginal}`
4. `putObject` no MinIO com content-type
5. Salvar metadados, retornar `DocumentoResponse`

#### `download(UUID id)`
1. Buscar metadados ou lançar "Documento não encontrado"
2. `getObject` no MinIO, retornar stream + metadados (o controller monta a resposta com content-type e nome)

#### `listar(Pageable pageable, UUID alunoId, TipoDocumento tipo)`
1. Com `alunoId` + `tipo`: `findByAlunoIdAndTipoDocumento`
2. Com só `alunoId`: `findByAlunoId`
3. Retornar `Page` mapeado

#### `remover(UUID id)`
1. Buscar metadados ou lançar "Documento não encontrado"
2. `removeObject` no MinIO (ignorar se objeto já não existir)
3. Deletar linha do banco

### Mapper
- `paraResponse(Documento)` (sem `copiarDados` — upload vem de `MultipartFile`, não de DTO)

## Critérios de aceite
- [ ] Upload salva no MinIO + metadados no banco
- [ ] Download retorna bytes com content-type correto
- [ ] Remover apaga objeto + linha
- [ ] Exceções customizadas; erros de IO embrulhados em `RuntimeException` com mensagem clara (500 via handler)

## Dependências
- Issues #19 (MinIO) e #20
