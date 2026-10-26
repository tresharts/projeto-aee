# [Frontend] Página pública do link mágico

## Descrição
Criar a página pública (sem senha) que o professor da escola regular acessa pelo link mágico (WhatsApp). Página simples, responsiva (celular), com 3-4 perguntas rápidas.

## Arquivos a criar
- `frontend/src/pages/ExternalFormPage.tsx` (nova)
- `frontend/src/components/external-form/ExternalForm.tsx` (novo componente)
- `frontend/src/lib/external-form.service.ts` (novo serviço de API pública)

## Detalhes técnicos

### Página pública
- Rota: `/external-form/:token` (pública, sem login)
- 3-4 perguntas fixas no MVP (ex: "Como foi a interação da criança esta semana?", "Apresentou alguma dificuldade específica?")
- Botão "Enviar" → `POST /api/external-form/{token}/submit`
- Feedback visual de sucesso/erro
- Responsiva: cabeçalho simples, formulário em coluna única, botão grande para toque

### Serviço
```typescript
export async function submeterRespostas(token: string, respostas: string[]) {
  return apiFetch(`/api/external-form/${token}/submit`, {
    method: 'POST',
    body: JSON.stringify({ respostas }),
  })
}
```

### Validação
- Ao carregar, verificar se o token é válido (`GET /api/external-form/{token}`)
- Se inválido/expirado, mostrar mensagem: "Link não encontrado ou expirado"

## Critérios de aceite
- [ ] Página pública acessível sem login
- [ ] 3-4 perguntas fixas
- [ ] Envio via POST pública
- [ ] Responsiva (testada em celular)
- [ ] Feedback de sucesso após envio

## Dependências
- Issue #30 (ExternalForm Controller público)
