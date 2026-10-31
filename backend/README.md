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
