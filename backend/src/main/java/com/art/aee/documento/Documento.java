package com.art.aee.documento;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documentos")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "O ID do aluno é obrigatório")
    @Column(nullable = false)
    private UUID alunoId;

    @NotBlank(message = "O nome do arquivo é obrigatório")
    @Column(nullable = false)
    private String nomeArquivo;

    @NotBlank(message = "O tipo de conteúdo é obrigatório")
    @Column(nullable = false)
    private String tipoConteudo;

    @NotNull(message = "O tamanho em bytes é obrigatório")
    @Column(nullable = false)
    private Long tamanhoBytes;

    @NotBlank(message = "A chave do MinIO é obrigatória")
    @Column(nullable = false, unique = true, length = 1024)
    private String chaveMinio;

    @NotNull(message = "O tipo do documento é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDocumento tipoDocumento;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataUpload;
}
