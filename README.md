# AEE Conecta

## Rodar localmente

Requisitos: Docker com Compose, Java 21, Node.js 20.19+ e npm. Execute os comandos a partir da raiz do repositório, exceto onde houver `cd`.

### 1. Iniciar o Docker

**Windows (Docker Desktop):** abra **Docker Desktop** pelo menu Iniciar e aguarde o mecanismo iniciar. Depois, confira no PowerShell:

```powershell
docker info
docker compose version
```

O serviço auxiliar do Windows, sozinho, não inicia o mecanismo do Docker Desktop. Se `docker info` não mostrar as informações do servidor, aguarde o Docker Desktop terminar de iniciar. Consulte a [instalação e inicialização do Docker Desktop no Windows](https://docs.docker.com/desktop/setup/install/windows-install/) se ainda não estiver instalado.

**Linux (Docker Engine com systemd):** inicie o serviço e confira a conexão:

```bash
sudo systemctl start docker
sudo docker info
docker compose version
```

Para iniciar o serviço automaticamente junto com o sistema, execute uma vez `sudo systemctl enable docker`. Os comandos `docker` abaixo precisam de `sudo` se seu usuário não tiver acesso ao socket do Docker. Veja as [instruções oficiais do Docker Engine para Linux](https://docs.docker.com/engine/install/linux-postinstall/).

Se você usa **Docker Desktop no Linux**, inicie-o pelo aplicativo ou com `systemctl --user start docker-desktop`; nesse caso, use os comandos `docker` sem `sudo`.

### 2. Subir PostgreSQL e MinIO

No PowerShell do Windows ou no Linux com Docker Desktop:

```text
docker compose up -d
docker compose ps
```

No Linux com Docker Engine, caso seu usuário precise de `sudo`:

```bash
sudo docker compose up -d
sudo docker compose ps
```

O Compose deste projeto sobe somente PostgreSQL e MinIO. Backend e frontend rodam nos próximos dois terminais.

### 3. Iniciar o backend

No Windows (PowerShell):

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

No Linux:

```bash
cd backend
./mvnw spring-boot:run
```

### 4. Iniciar o frontend

Em outro terminal, a partir da raiz do repositório, no Windows ou Linux:

```text
cd frontend
npm ci
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
