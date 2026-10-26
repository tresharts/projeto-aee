# [Frontend] Conectar DashboardPage ao backend real

## Descrição
Conectar o dashboard existente na branch `feature/dashboard-aee-vinicius` ao backend real via `useDashboardData` em modo `api`, substituindo o mock por dados da API.

## Arquivos a modificar
- `frontend/src/features/dashboard/useDashboardData.ts` (ajustar modo padrão para `api` ou manter `demo` por variável de ambiente)
- `frontend/src/features/dashboard/dashboard.service.ts` (adicionar chamada a `GET /api/dashboard`)
- `frontend/src/lib/api.ts` (ajustar se necessário para o novo endpoint)

## Detalhes técnicos

### Endpoint a consumir
```
GET /api/dashboard
Authorization: Bearer <token>
```

### Fluxo
1. `useDashboardData` chama `getDashboardApiPayload()`
2. `getDashboardApiPayload()` chama `apiFetch('/api/dashboard')`
3. O retorno já vem no formato `DashboardData` (ou mapeado no frontend)
4. Componentes (`AgendaPanel`, `AlertsPanel`, `SchoolReturnsPanel`, etc.) recebem `data` já mapeado

### Ajustes no mapper
O mapper existente (`dashboard.mappers.ts`) mapeia `DashboardApiPayload` com `students` e `attendances`. Pode precisar de ajuste para incluir `alertas` e `feedRetornos` vindos do backend.

## Critérios de aceite
- [ ] Dashboard consome `/api/dashboard` em modo `api`
- [ ] Modo `demo` continua funcionando (variável de ambiente `VITE_DASHBOARD_DATA_MODE`)
- [ ] Erros de autenticação (401) tratados pelo `ApiError` existente
- [ ] Build do frontend passa (`vite build`)

## Dependências
- Issue #27 (Dashboard Controller)
