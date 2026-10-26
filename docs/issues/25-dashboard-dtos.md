# [Dashboard] Criar DTOs de resposta do Dashboard

## Descrição
Criar os DTOs (records) usados para retornar as agregações do Centro de Comando (Tela 1): agenda do dia, alertas automáticos e feed de retornos das escolas regulares.

## Arquivos a criar
- `backend/src/main/java/com/art/aee/dashboard/dto/DashboardResponse.java`

## Detalhes técnicos

### DashboardResponse
```java
public record DashboardResponse(
        List<AtendimentoHoje> agendaDoDia,
        List<AlertaAutomatico> alertas,
        List<RetornoEscola> feedRetornos
) {}
```

### AtendimentoHoje (alunos atendidos hoje)
| Campo | Tipo |
|---|---|
| `alunoId` | UUID |
| `nomeAluno` | String |
| `nomeTurma` | String |
| `nomeEscola` | String |
| `dataHora` | LocalDateTime |
| `presente` | boolean |
| `humor` | Humor (opcional) |
| `foco` | Foco (opcional) |

### AlertaAutomatico
| Campo | Tipo |
|---|---|
| `id` | UUID |
| `tipo` | String (ex: "FALTAS_ACUMULADAS", "PEI_VENCENDO") |
| `mensagem` | String |
| `severidade` | String (ex: "VERMELHO", "LARANJA") |

### RetornoEscola (feed do professor da escola regular)
| Campo | Tipo |
|---|---|
| `id` | UUID |
| `nomeProfessorEscola` | String |
| `escola` | String |
| `mensagem` | String |
| `dataEnvio` | LocalDateTime |
| `alunoId` | UUID (opcional) |

## Critérios de aceite
- [ ] Records com todos os campos listados
- [ ] Mensagens de erro (se houver validação) em português
- [ ] Compila sem erros

## Dependências
- Issue #15 (entidade Atendimento)
- Issue #28 (entidade ExternalForm/Retornos)
