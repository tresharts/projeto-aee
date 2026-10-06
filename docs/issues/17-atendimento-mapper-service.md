# [Atendimento] Implementar AtendimentoMapper + Service

## Descrição
Criar o mapper (`@Component`, padrão do projeto) e a camada de serviço do Atendimento. Não há delete — histórico de atendimento não se apaga.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/atendimento/AtendimentoMapper.java`
- `backend/src/main/java/com/art/aee/atendimento/AtendimentoService.java`

## Detalhes técnicos

### Dependências do Service
- `AtendimentoRepository`
- `AlunoRepository` (validar `alunoId` + buscar `nomeAluno`)
- `AtendimentoMapper`

### Métodos

#### `criar(AtendimentoRequest request)`
1. Validar que o aluno existe (`RecursoNaoEncontradoException`: "Aluno não encontrado")
2. Criar entidade, salvar, retornar `AtendimentoResponse`

#### `atualizar(UUID id, AtendimentoRequest request)`
1. Buscar atendimento (`RecursoNaoEncontradoException`: "Atendimento não encontrado")
2. Se `alunoId` mudou, revalidar aluno
3. Atualizar campos (não mexer em `dataCadastro`), salvar, retornar response

#### `buscarPorId(UUID id)`
1. Buscar ou lançar "Atendimento não encontrado"
2. Retornar response

#### `listar(Pageable pageable, UUID alunoId, LocalDateTime inicio, LocalDateTime fim)`
1. Se `alunoId` + período: `findByAlunoIdAndDataHoraBetween`
2. Se só `alunoId`: `findByAlunoId`
3. Se nenhum filtro: `findAll`
4. Sempre retornar `Page` mapeado (`.map(mapper::paraResponse)`)

### Mapper
- `copiarDados(AtendimentoRequest, Atendimento)`
- `paraResponse(Atendimento)` — busca `nomeAluno` via `AlunoRepository` (nulo se aluno removido)

## Critérios de aceite
- [ ] Todos os métodos implementados (sem delete propositalmente)
- [ ] Exceções customizadas (`RecursoNaoEncontradoException`)
- [ ] Paginação com `Page` direto do repository
- [ ] Sem comentários no código

## Dependências
- Issue #16
