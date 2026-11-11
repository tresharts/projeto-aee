package com.art.aee.atendimento;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "atendimento_objetivos_pei", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"atendimento_id", "objetivo_pei_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class AtendimentoObjetivoPei {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "atendimento_id", nullable = false)
    private UUID atendimentoId;

    @Column(name = "objetivo_pei_id", nullable = false)
    private UUID objetivoPeiId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricaoObjetivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NivelEvolucao nivel;

    @Column(columnDefinition = "TEXT")
    private String observacao;
}
