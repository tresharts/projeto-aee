# [Frontend] Integrar feed de retornos ao Dashboard

## Descrição
Integrar o `SchoolReturnsPanel` (já existente na branch) ao feed de retornos enviado pelas escolas regulares via External Form, consumindo o backend.

## Arquivos a modificar
- `frontend/src/components/dashboard/SchoolReturnsPanel.tsx` (consumir dados reais)
- `frontend/src/features/dashboard/dashboard.types.ts` (ajustar tipos se necessário)
- `frontend/src/features/dashboard/dashboard.mappers.ts` (mapear `feedRetornos`)

## Detalhes técnicos

### Componente SchoolReturnsPanel
- Recebe `returns: SchoolReturn[]` e `state: IntegrationState`
- Mostra cada retorno: professor da escola, escola, mensagem, data de envio
- Se `state === 'pending'`, mostra placeholder
- Se `state === 'empty'`, mostra mensagem de vazio

### Tipos
`SchoolReturn` já existe em `dashboard.types.ts` com: `id`, `teacherName`, `schoolName`, `message`, `hashtag`, `avatarTone`.

### Mapeamento
O backend retorna `feedRetornos` na `DashboardResponse`. O mapper deve preencher `schoolReturns` e definir `schoolReturnsState` (`available`, `pending` ou `empty`).

## Critérios de aceite
- [ ] `SchoolReturnsPanel` exibe retornos reais da API
- [ ] Estados `pending`, `empty`, `available` funcionam
- [ ] Erros de carregamento não quebram a página

## Dependências
- Issue #30 (ExternalForm Controller)
- Issue #31 (Frontend integração dashboard)
