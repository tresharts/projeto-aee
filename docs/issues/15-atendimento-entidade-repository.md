# [Atendimento] Criar entidade Atendimento + Repository

## Descrição
Criar a entidade JPA `Atendimento` e seu repositório. O Atendimento representa um registro de check-in do aluno (presença ou falta, humor, foco e anotações). É o que alimenta a Aba 2 (Linha do Tempo) do Prontuário.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/atendimento/Atendimento.java`
- `backend/src/main/java/com/art/aee/atendimento/AtendimentoRepository.java`

## Detalhes técnicos

### Entidade Atendimento
| Campo | Tipo | Validação |
|---|---|---|
| `id` | UUID | auto-gerado |
| `alunoId` | UUID | obrigatório |
| `professorId` | UUID | opcional (quem registrou) |
| `dataHora` | LocalDateTime | obrigatória, não futura |
| `humor` | Humor (enum) | opcional (falta não tem humor) |
| `foco` | Foco (enum) | opcional (falta não tem foco) |
| `observacoes` | String (TEXT) | opcional (texto livre) |
| `presente` | Boolean | obrigatório, default true |
| `dataCadastro` | LocalDateTime | auto-gerado (`@CreationTimestamp`) |

Enums persistidos como `STRING` (`@Enumerated(EnumType.STRING)`).

### Repository
- Estender `JpaRepository<Atendimento, UUID>`
- `Page<Atendimento> findByAlunoId(UUID alunoId, Pageable pageable)`
- `Page<Atendimento> findByAlunoIdAndDataHoraBetween(UUID alunoId, LocalDateTime inicio, LocalDateTime fim, Pageable pageable)`

## Critérios de aceite
- [ ] Entidade mapeada corretamente com anotações JPA
- [ ] Validações com Bean Validation
- [ ] Repository com métodos paginados (`Page`, nunca `List` + `Pageable`)
- [ ] `dataCadastro` preenchido automaticamente
- [ ] `presente` default true (com `@Builder.Default` se usar `@Builder`)

## Dependências
- Issue #14 (enums)
