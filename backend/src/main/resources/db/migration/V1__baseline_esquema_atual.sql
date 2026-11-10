CREATE TABLE escolas (
    id uuid PRIMARY KEY,
    nome varchar(100) NOT NULL,
    codigo_cadastro varchar(10) UNIQUE
);

CREATE TABLE professores (
    id uuid PRIMARY KEY,
    email varchar(255) NOT NULL UNIQUE,
    name varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    role varchar(255) NOT NULL CHECK (role IN ('ADMIN', 'PROFESSOR')),
    account_status varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (account_status IN ('PENDING', 'APPROVED')),
    escola_id uuid
);

CREATE TABLE turmas (
    id uuid PRIMARY KEY,
    ano integer NOT NULL,
    escola_id uuid NOT NULL,
    nome varchar(100) NOT NULL,
    ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE alunos (
    id uuid PRIMARY KEY,
    ativo boolean NOT NULL,
    contatos_emergencia text,
    data_cadastro timestamp(6) NOT NULL,
    data_nascimento date NOT NULL,
    diagnostico text,
    email varchar(255),
    foto_url varchar(255),
    informacoes_familia text,
    nome varchar(100) NOT NULL,
    telefone varchar(255),
    turma_id uuid NOT NULL
);

CREATE TABLE documentos (
    id uuid PRIMARY KEY,
    aluno_id uuid NOT NULL,
    chave_minio varchar(1024) NOT NULL UNIQUE,
    data_upload timestamp(6) NOT NULL,
    nome_arquivo varchar(255) NOT NULL,
    tamanho_bytes bigint NOT NULL,
    tipo_conteudo varchar(255) NOT NULL,
    tipo_documento varchar(255) NOT NULL CHECK (tipo_documento IN ('LAUDO', 'PEI', 'OUTRO'))
);

CREATE TABLE atendimentos (
    id uuid PRIMARY KEY,
    aluno_id uuid NOT NULL,
    data_cadastro timestamp(6) NOT NULL,
    data_hora timestamp(6) NOT NULL,
    foco varchar(255) CHECK (foco IN ('ALTO', 'MEDIO', 'BAIXO')),
    humor varchar(255) CHECK (humor IN ('CALMO', 'AGITADO', 'APATICO')),
    observacoes text,
    presente boolean NOT NULL,
    professor_id uuid,
    atividade_realizada text,
    desenvolvimento varchar(255) CHECK (desenvolvimento IN ('AUTONOMO', 'ORIENTACAO_VERBAL', 'AJUDA_VISUAL', 'NAO_CONCLUIDO', 'NAO_AVALIADO')),
    estrategias_utilizadas text,
    evolucao_atencao varchar(255) CHECK (evolucao_atencao IN ('NAO_AVALIADO', 'INICIAL', 'EM_DESENVOLVIMENTO', 'CONSOLIDADO')),
    evolucao_autonomia varchar(255) CHECK (evolucao_autonomia IN ('NAO_AVALIADO', 'INICIAL', 'EM_DESENVOLVIMENTO', 'CONSOLIDADO')),
    evolucao_comunicacao varchar(255) CHECK (evolucao_comunicacao IN ('NAO_AVALIADO', 'INICIAL', 'EM_DESENVOLVIMENTO', 'CONSOLIDADO')),
    evolucao_participacao varchar(255) CHECK (evolucao_participacao IN ('NAO_AVALIADO', 'INICIAL', 'EM_DESENVOLVIMENTO', 'CONSOLIDADO')),
    habilidades_trabalhadas text,
    humor_outro text,
    participacao varchar(255) CHECK (participacao IN ('ATIVA', 'PARCIAL', 'MINIMA', 'RESISTENCIA', 'NAO_AVALIADA')),
    proximos_passos text,
    recursos_utilizados text
);

CREATE TABLE objetivos_pei (
    id uuid PRIMARY KEY,
    aluno_id uuid NOT NULL,
    ativo boolean NOT NULL,
    data_cadastro timestamp(6) NOT NULL,
    descricao varchar(2000) NOT NULL,
    documento_pei_id uuid
);

CREATE TABLE atendimento_objetivos_pei (
    id uuid PRIMARY KEY,
    atendimento_id uuid NOT NULL,
    descricao_objetivo text NOT NULL,
    nivel varchar(255) NOT NULL CHECK (nivel IN ('NAO_AVALIADO', 'INICIAL', 'EM_DESENVOLVIMENTO', 'CONSOLIDADO')),
    objetivo_pei_id uuid NOT NULL,
    observacao text,
    CONSTRAINT uk_atendimento_objetivo_pei UNIQUE (atendimento_id, objetivo_pei_id)
);

CREATE TABLE refresh_tokens (
    id uuid PRIMARY KEY,
    expires_at timestamp(6) with time zone NOT NULL,
    token varchar(255) NOT NULL,
    professor_id uuid NOT NULL,
    CONSTRAINT fk_refresh_token_professor FOREIGN KEY (professor_id) REFERENCES professores(id)
);
