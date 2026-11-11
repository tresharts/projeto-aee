# Frontend AEE Conecta

React, TypeScript e Vite. Todas as telas consultam o backend por `/api` e `/auth`.

Para iniciar o projeto completo e acessar as contas de demonstração, siga o [README principal](../README.md).

```powershell
npm install
npm run dev
```

O Vite encaminha `/api` e `/auth` para `http://localhost:8080`. Configure `VITE_API_PROXY_TARGET` em `.env.local` somente se o backend usar outra porta. O dashboard consulta alunos, atendimentos, objetivos do PEI, retornos de formulários, sessões e alertas da API. Sem backend, a tela mostra o erro de conexão.
