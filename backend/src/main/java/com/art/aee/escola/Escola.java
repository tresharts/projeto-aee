package com.art.aee.escola;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "escolas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Escola {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "O nome da escola é obrigatório")
    @Size(max = 100, message = "O nome da escola não pode ultrapassar 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nome;
}