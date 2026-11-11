CREATE TABLE formularios_externos (
    id uuid PRIMARY KEY,
    aluno_id uuid NOT NULL,
    professor_id uuid NOT NULL,
    token varchar(36) NOT NULL UNIQUE,
    perguntas jsonb NOT NULL,
    respostas jsonb,
    data_cadastro timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_resposta timestamp(6)
);

CREATE INDEX idx_formularios_externos_professor
    ON formularios_externos (professor_id, data_cadastro DESC);

CREATE INDEX idx_formularios_externos_aluno
    ON formularios_externos (aluno_id, data_cadastro DESC);
