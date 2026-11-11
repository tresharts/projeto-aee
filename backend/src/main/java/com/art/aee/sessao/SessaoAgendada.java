package com.art.aee.sessao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessoes_agendadas")
@Getter
@Setter
@NoArgsConstructor
public class SessaoAgendada {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(name = "aluno_id", nullable = false)
    private UUID alunoId;

    @NotNull
    @Column(name = "professor_id", nullable = false)
    private UUID professorId;

    @NotNull
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessaoStatus status = SessaoStatus.AGENDADA;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "atendimento_id")
    private UUID atendimentoId;

    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
}
