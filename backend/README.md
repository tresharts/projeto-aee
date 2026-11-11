# Backend AEE Conecta

## Conta inicial da coordenação e escola

Na primeira inicialização, configure o e-mail admin e o nome da escola. Se a escola não existir, o backend a cria e gera um código de cadastro aleatório. Para criar uma nova conta admin, também informe uma senha forte. Guarde a senha fora do repositório.

```powershell
$env:ADMIN_EMAIL = "coordenacao@escola.edu.br"
$env:ADMIN_PASSWORD = "uma-senha-forte-com-12-ou-mais-caracteres"
$env:ADMIN_NAME = "Coordenação AEE"
$env:ADMIN_SCHOOL_NAME = "Escola Municipal Exemplo"
.\mvnw.cmd spring-boot:run
```

Se o admin já existe, `ADMIN_PASSWORD` pode ser omitida; informe o mesmo e-mail e o nome da escola para vincular a conta. O backend não altera a senha de um `ADMIN` existente. Contas preexistentes ainda sem escola são vinculadas à escola configurada na primeira migração do piloto de uma escola.

## Aprovação de cadastros

- `POST /auth/register` recebe `name`, `email`, `codigoEscola` e `password`, registra a professora na escola do código com status `PENDING` e não inicia uma sessão.
- `POST /auth/login` só autentica contas aprovadas (ou administradores).
- `GET /api/admin/usuarios/pendentes` lista solicitações e exige um access token de administrador.
- `POST /api/admin/usuarios/{id}/aprovar` aprova a professora e exige um access token de administrador.
- `GET /api/admin/escola/codigo-cadastro` mostra o código da escola associado ao admin.

O refresh token é enviado somente em cookie HttpOnly, Secure e SameSite=Strict. Em desenvolvimento, use o proxy do Vite para manter frontend e backend na mesma origem.

## Atendimentos

Os endpoints autenticados `GET /api/atendimentos`, `GET /api/atendimentos/{id}`, `POST /api/atendimentos` e `PUT /api/atendimentos/{id}` recebem e retornam, além dos campos básicos, `participacao`, `desenvolvimento`, `humorOutro`, `atividadeRealizada`, `recursosUtilizados`, `habilidadesTrabalhadas`, `estrategiasUtilizadas`, `proximosPassos` e os níveis `evolucaoParticipacao`, `evolucaoComunicacao`, `evolucaoAtencao` e `evolucaoAutonomia`. `observacoes` representa o relato do que aconteceu durante o atendimento.

Na criação são obrigatórios aluno, data/hora, humor, participação, desenvolvimento e presença. Observações, estratégias e próximos passos são opcionais. A interface oferece múltiplas escolhas e uma opção Outro com texto obrigatório quando selecionada; os resultados são armazenados nos campos textuais existentes, com uma opção por linha. Textos antigos são preservados na opção Outro durante a edição. Para `humor=OUTRO`, `humorOutro` também é obrigatório. Nos updates, campos detalhados omitidos são preservados; envie texto vazio para limpar campos de texto opcionais, use `NAO_AVALIADO` para limpar uma avaliação e envie `objetivosPei: []` para remover os vínculos de objetivos do atendimento.

Os valores disponíveis para `humor` incluem `FELIZ`, `TRISTE`, `DISPERSO`, `IRRITADO` e `OUTRO`, mantendo os valores anteriores `CALMO`, `AGITADO` e `APATICO`. `participacao` aceita `ATIVA`, `PARCIAL`, `MINIMA`, `RESISTENCIA` ou `NAO_AVALIADA`; `desenvolvimento` aceita `AUTONOMO`, `ORIENTACAO_VERBAL`, `AJUDA_VISUAL`, `NAO_CONCLUIDO` ou `NAO_AVALIADO`. Os quatro níveis de evolução aceitam `NAO_AVALIADO`, `INICIAL`, `EM_DESENVOLVIMENTO` ou `CONSOLIDADO`.

O esquema é controlado pelo Flyway. `V1__baseline_esquema_atual.sql` documenta o esquema existente e cria o mesmo esquema em bancos vazios; `V2__expandir_humores_atendimento.sql` atualiza a restrição de humor. Em bancos existentes sem histórico do Flyway, o baseline automático registra a versão 1 e aplica a versão 2 sem recriar tabelas nem apagar dados. O Hibernate valida o esquema (`ddl-auto=validate`) e não faz alterações automáticas.

Objetivos de PEI são gerenciados em `/api/alunos/{alunoId}/objetivos-pei`: `GET` lista objetivos ativos (`?incluirInativos=true` inclui os desativados), `POST` cria, `PUT /{objetivoId}` atualiza e `DELETE /{objetivoId}` desativa. Cada objetivo pode referenciar um documento do aluno cujo tipo seja `PEI`. Um atendimento recebe `objetivosPei` como uma lista de `{ objetivoPeiId, nivel, observacao }`; a descrição é copiada para o vínculo do atendimento para preservar o histórico. A listagem de atendimentos inclui os quatro níveis de evolução e esses vínculos, permitindo construir o gráfico a partir dos últimos registros sem calcular percentuais artificiais.
