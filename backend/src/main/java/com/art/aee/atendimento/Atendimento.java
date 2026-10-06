package com.art.aee.atendimento;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "atendimentos")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "O ID do aluno é obrigatório")
    @Column(nullable = false)
    private UUID alunoId;

    private UUID professorId;

    @NotNull(message = "A data e hora do atendimento são obrigatórias")
    @PastOrPresent(message = "A data e hora do atendimento não podem ser futuras")
    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    private Humor humor;

    @Enumerated(EnumType.STRING)
    private Foco foco;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @NotNull(message = "A presença é obrigatória")
    @Column(nullable = false)
    @Builder.Default
    private Boolean presente = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
}
