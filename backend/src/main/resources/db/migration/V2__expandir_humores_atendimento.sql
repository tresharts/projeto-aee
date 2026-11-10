ALTER TABLE atendimentos DROP CONSTRAINT IF EXISTS atendimentos_humor_check;

ALTER TABLE atendimentos
    ADD CONSTRAINT atendimentos_humor_check
    CHECK (humor IS NULL OR humor IN (
        'CALMO', 'AGITADO', 'APATICO', 'FELIZ', 'TRISTE', 'DISPERSO', 'IRRITADO', 'OUTRO'
    ));
