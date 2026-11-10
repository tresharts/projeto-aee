CREATE TABLE IF NOT EXISTS sessoes_agendadas (
    id uuid PRIMARY KEY,
    aluno_id uuid NOT NULL,
    professor_id uuid NOT NULL,
    data_hora timestamp(6) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'AGENDADA'
        CHECK (status IN ('AGENDADA', 'REALIZADA', 'FALTA', 'CANCELADA')),
    observacao text,
    atendimento_id uuid,
    data_cadastro timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessoes_professor_data
    ON sessoes_agendadas (professor_id, data_hora);

CREATE INDEX IF NOT EXISTS idx_sessoes_aluno_data
    ON sessoes_agendadas (aluno_id, data_hora);
