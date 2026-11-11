package com.art.aee.pei;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "objetivos_pei")
@Getter
@Setter
@NoArgsConstructor
public class ObjetivoPei {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(nullable = false)
    private UUID alunoId;

    @Column
    private UUID documentoPeiId;

    @NotBlank(message = "A descrição do objetivo é obrigatória")
    @Size(max = 2000, message = "A descrição do objetivo não pode ultrapassar 2000 caracteres")
    @Column(nullable = false, length = 2000)
    private String descricao;

    @Column(nullable = false)
    private boolean ativo = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
}
