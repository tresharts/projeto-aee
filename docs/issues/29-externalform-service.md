# [ExternalForm] Implementar Service

## Descrição
Criar a camada de serviço do External Form (Link Mágico): gerar link seguro, submeter respostas da escola regular e buscar retornos para o Dashboard.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/externalform/ExternalFormService.java`

## Detalhes técnicos

### Dependências
- `ExternalFormRepository`
- `AlunoRepository` (validar aluno ao gerar link)

### Métodos

#### `gerarLink(UUID professorAeeId, UUID alunoId, List<String> perguntas)`
1. Validar que o aluno existe (`RecursoNaoEncontradoException`)
2. Gerar `token` = UUID.randomUUID().toString()
3. Salvar `ExternalForm` com `ativa = true`, `dataEnvio = null`
4. Retornar o token (para montar o link `https://app-aee.com/external-form/{token}`)

#### `submeterRespostas(String token, List<String> respostas)`
1. Buscar por token (`findByToken`) — se não encontrar, `RecursoNaoEncontradoException`
2. Validar que ainda está ativa (`ativa = true`)
3. Preencher `respostas` (JSON) e `dataEnvio = agora`
4. Salvar e retornar `ExternalFormResponse`

#### `buscarRetornos(Pageable pageable, LocalDateTime inicio, LocalDateTime fim)`
1. Buscar submissões com `dataEnvio` entre `inicio` e `fim`
2. Ordenar por `dataEnvio` desc
3. Retornar página mapeada (Page)

## Critérios de aceite
- [ ] Geração de link com token único
- [ ] Submissão de respostas apenas se ativa
- [ ] Busca de retornos por período paginada
- [ ] Exceções customizadas (`RecursoNaoEncontradoException`)

## Dependências
- Issue #28 (Entidade + Repository)
