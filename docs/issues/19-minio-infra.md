# [Infra] Configurar MinIO (docker-compose + SDK + bucket)

## Descrição
Adicionar o MinIO ao `docker-compose.yml`, configurar o client no backend e garantir a criação do bucket de documentos.

## Arquivos a criar/modificar
- `docker-compose.yml` (adicionar serviço `minio`)
- `backend/pom.xml` (adicionar SDK `io.minio:minio`, versão estável recente do Maven Central)
- `backend/src/main/resources/application.properties` (adicionar chaves)
- `backend/src/main/java/com/art/aee/config/MinioConfig.java` (novo, `@Bean MinioClient` + criação do bucket na subida)

## Detalhes técnicos

### docker-compose
```yaml
minio:
  image: minio/minio:latest
  container_name: aee-minio
  ports:
    - "9000:9000"
    - "9001:9001"
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin123
  command: server /data --console-address ":9001"
  volumes:
    - minio_data:/data
```
Console em `http://localhost:9001`.

### application.properties
```properties
minio.url=${MINIO_URL:http://localhost:9000}
minio.access-key=${MINIO_ACCESS_KEY:minioadmin}
minio.secret-key=${MINIO_SECRET_KEY:minioadmin123}
minio.bucket=${MINIO_BUCKET:aee-documentos}
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### MinioConfig
- `@Bean MinioClient` com url + credenciais
- Criar o bucket `aee-documentos` na subida se não existir (`bucketExists`/`makeBucket`)

### Convenção de chaves
`alunos/{alunoId}/{uuid}-{nomeOriginal}` — UUID evita colisão de nomes iguais.

## Critérios de aceite
- [ ] `docker compose up -d` sobe MinIO junto do Postgres
- [ ] Bucket criado automaticamente na subida do backend
- [ ] Upload manual via console funciona

## Dependências
- Nenhuma
