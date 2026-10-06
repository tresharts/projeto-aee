package com.art.aee.turma;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "turmas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nome;

    @NotNull(message = "Ano é obrigatório")
    @Column(nullable = false)
    private Integer ano;

    @NotNull(message = "Escola é obrigatória")
    @Column(nullable = false)
    private UUID escolaId;
}
