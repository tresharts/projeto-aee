# [Dashboard] Implementar Service de Dashboard

## Descrição
Criar a camada de serviço do Dashboard, responsável por agregar os dados do Centro de Comando: alunos atendidos hoje, alertas automáticos e feed de retornos das escolas regulares.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/dashboard/DashboardService.java`

## Detalhes técnicos

### Dependências
- `AtendimentoRepository` (para alunos atendidos hoje)
- `ExternalFormRepository` (para feed de retornos das escolas)
- `AlunoRepository` (para dados dos alunos)
- `TurmaRepository` / `EscolaRepository` (para nome da turma/escola)

### Métodos

#### `buscarDashboard(UUID professorId)`
1. Alunos atendidos hoje:
   - Buscar atendimentos de hoje (`dataCadastro` entre hoje 00:00 e 23:59)
   - Agrupar por aluno (um aluno pode ter vários atendimentos, considerar o mais recente)
   - Retornar lista ordenada por data/hora do atendimento
2. Alertas automáticos (fixos no MVP):
   - "João faltou 3 vezes": alunos com 3 ou mais ausências acumuladas
   - "PEI da Maria vence em 15 dias": alunos com PEI vencendo em até 15 dias
   - Criar 1 alerta por aluno, ordenar por severidade
3. Feed de retornos:
   - Buscar submissões do ExternalForm (link mágico) recentes (últimos 30 dias)
   - Ordenar por data de envio desc
4. Retornar `DashboardResponse` com as 3 listas

### Observações
- Professora logada = quem consulta (filtro por `professorId` se aplicável)
- Sem paginação no MVP (dashboard mostra o essencial)

## Critérios de aceite
- [ ] Todos os métodos implementados
- [ ] Agenda do dia com alunos atendidos hoje
- [ ] Alertas de faltas (>=3) e PEI vencendo (<=15 dias)
- [ ] Feed de retornos das escolas (external form)
- [ ] Exceções customizadas (`RecursoNaoEncontradoException` se necessário)

## Dependências
- Issue #25 (DTOs)
- Issue #21 (DocumentoService/Repository como referência de padrão)
- Issue #28 (ExternalForm Repository)
