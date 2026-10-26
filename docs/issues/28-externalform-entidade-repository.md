# [ExternalForm] Criar Entidade + Repository

## Descrição
Criar a entidade JPA `ExternalForm` e seu repositório. Representa o "Link Mágico" enviado pelo professor do AEE ao professor da escola regular, com as respostas rápidas enviadas de volta.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/externalform/ExternalForm.java`
- `backend/src/main/java/com/art/aee/externalform/ExternalFormRepository.java`

## Detalhes técnicos

### Entidade ExternalForm
| Campo | Tipo | Validação |
|---|---|---|
| `id` | UUID | auto-gerado |
| `token` | String | obrigatório, único (UUID aleatório) |
| `alunoId` | UUID | obrigatório |
| `professorAeeId` | UUID | obrigatório (quem gerou o link) |
| `perguntas` | String (JSON TEXT) | obrigatório (perguntas configuradas) |
| `respostas` | String (JSON TEXT) | opcional (preenchido ao submeter) |
| `dataEnvio` | LocalDateTime | opcional (quando a escola submeteu) |
| `ativa` | boolean | obrigatório, default true |

### Repository
- Estender `JpaRepository<ExternalForm, UUID>`
- `Optional<ExternalForm> findByToken(String token)`
- `List<ExternalForm> findByProfessorAeeId(UUID professorAeeId, Pageable pageable)`
- `List<ExternalForm> findByDataEnvioBetween(LocalDateTime inicio, LocalDateTime fim, Pageable pageable)`

## Critérios de aceite
- [ ] Entidade mapeada com Bean Validation
- [ ] `token` com constraint única
- [ ] Repository com `findByToken`
- [ ] `ativa` default true

## Dependências
- Nenhuma (pode ser criada em paralelo ao Dashboard)
