# AEE Conecta

## Iniciar a apresentação local

Requisitos: Docker, Java 21, Node.js 20.19+ e npm.

```powershell
docker compose up -d
```

Em outro terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Em um terceiro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O Flyway cria as tabelas no PostgreSQL e a inicialização do backend preenche a escola de demonstração com turmas, alunos, atendimentos, objetivos do PEI, sessões de hoje e amanhã e uma resposta de formulário. Reiniciar o backend não duplica esses registros. O dashboard busca os dados pela API; relatórios PDF são gerados a partir dos atendimentos do banco no perfil do aluno.

## Contas de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Professora Camila | `professora.demo@aee.local` | `AeeDemo2026!` |
| Coordenação | `coordenacao.demo@aee.local` | `AeeDemo2026!` |

O código de cadastro da **Escola Demonstração AEE** é `AEEDEMO`. Essas contas e dados são fictícios e são criados apenas para execução local do projeto. A senha dessas contas é restaurada ao iniciar o backend, para que o acesso documentado continue funcionando.

Ao usar um banco com dados reais, defina `AEE_DEMO_SEED_ENABLED=false` antes de iniciar o backend.
