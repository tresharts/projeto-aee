package com.art.aee.aluno;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "alunos")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 100, message = "O nome não pode ultrapassar 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nome;

    @NotNull(message = "A data de nascimento é obrigatória")
    @Past(message = "A data de nascimento não pode ser uma data futura")
    @Column(nullable = false)
    private LocalDate dataNascimento;

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    private String fotoUrl;

    @Column(columnDefinition = "TEXT")
    private String informacoesFamilia;

    @Column(columnDefinition = "TEXT")
    private String contatosEmergencia;

    @Email(message = "Formato de e-mail inválido")
    private String email;

    private String telefone;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @NotNull(message = "O ID da turma é obrigatório")
    @Column(nullable = false)
    private UUID turmaId;
}
