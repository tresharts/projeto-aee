# [Frontend] Tela de geração de link seguro

## Descrição
Criar a tela dentro do sistema (protegida por senha) onde o professor do AEE gera o "Link Seguro" para enviar ao professor da escola regular pelo WhatsApp.

## Arquivos a criar/modificar
- `frontend/src/pages/ExternalFormGenerate.tsx` (nova, protegida)
- `frontend/src/lib/external-form.service.ts` (adicionar método de geração)
- Rotas do frontend (adicionar rota protegida)

## Detalhes técnicos

### Tela de geração
- Rota: `/external-form/gerar` (protegida, requer login AEE)
- Selecionar aluno (dropdown com alunos cadastrados)
- Definir perguntas (fixas no MVP, exibir apenas)
- Botão "Gerar link seguro"
- Ao gerar: mostrar o link completo (`https://app-aee.com/external-form/{token}`) com botão "Copiar"
- Mensagem de orientação: "Envie este link pelo WhatsApp do professor da escola regular"

### Serviço
```typescript
export async function gerarLink(alunoId: string, perguntas: string[]) {
  return apiFetch('/api/external-form/generate', {
    method: 'POST',
    body: JSON.stringify({ alunoId, perguntas }),
  })
}
```

### Autenticação
- Requer `Bearer token` (professor do AEE logado)
- Se não autenticado, redireciona para login

## Critérios de aceite
- [ ] Tela protegida (apenas professores do AEE)
- [ ] Seleção de aluno e geração de link
- [ ] Link completo exibido com botão copiar
- [ ] Integração com endpoint `POST /api/external-form/generate`

## Dependências
- Issue #30 (ExternalForm Controller público)
- Issue #31 (Frontend integração dashboard, para contexto de rotas)
