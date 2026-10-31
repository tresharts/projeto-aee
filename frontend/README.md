# Frontend — Dashboard AEE Conecta

Implementação isolada da tela de Dashboard em React, TypeScript, Vite e Tailwind CSS. Nenhuma outra tela do sistema faz parte deste frontend.

## Requisitos

- Node.js 20.19+ (ou 22.12+)
- npm 10+
- Java 21, PostgreSQL e backend em execução somente para o modo API

## Executar no Windows / VS Code

```powershell
cd frontend
npm install
npm run dev:demo
```

Abra `http://localhost:5173`.

Modo API, com o backend local em `http://localhost:8080`:

```powershell
cd frontend
npm run dev:api
```

## Executar no Linux/macOS

```bash
cd frontend
npm install
npm run dev:demo
```

## Configuração

Copie `.env.example` para `.env.local` apenas quando precisar personalizar o ambiente:

- `VITE_DASHBOARD_DATA_MODE=demo|api`
- `VITE_API_BASE_URL=`: URL absoluta opcional. Vazio usa o proxy do Vite.
- `VITE_API_PROXY_TARGET=http://localhost:8080`: endereço do backend usado pelo proxy.

Não coloque tokens em arquivos `.env`. O cliente HTTP mantém o access token somente em memória e tenta renovar a sessão com `POST /auth/refresh` usando o cookie HttpOnly do backend. Quando o futuro módulo de autenticação for adicionado, ele deve chamar `setApiAccessToken` de `src/lib/api.ts` após login.

## Integração real disponível

- `GET /api/alunos`: total paginado e busca por nome.
- `GET /api/atendimentos`: total paginado e amostra de registros já realizados.
- `POST /auth/refresh`: renovação da sessão por cookie, quando houver uma sessão válida.

O backend atual não possui agenda futura nem contratos para alertas de frequência/evasão, PEIs/laudos, retornos de escolas ou indicadores pedagógicos. No modo API, esses blocos exibem integração pendente e nunca recebem dados fictícios. O modo demo é identificado de forma visível e discreta.

## Verificações

```powershell
npm run build
npm run lint
npm test
```
