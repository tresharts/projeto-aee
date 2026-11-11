package com.art.aee.documento;

import com.art.aee.aluno.AlunoRepository;
import com.art.aee.documento.dto.DocumentoResponse;
import com.art.aee.exception.RecursoNaoEncontradoException;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.MinioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DocumentoService {

    private static final String CHAVE_PADRAO = "alunos/%s/%s-%s";

    private final DocumentoRepository documentoRepository;
    private final AlunoRepository alunoRepository;
    private final MinioClient minioClient;
    private final String bucket;
    private final DocumentoMapper documentoMapper;

    public DocumentoService(
            DocumentoRepository documentoRepository,
            AlunoRepository alunoRepository,
            MinioClient minioClient,
            DocumentoMapper documentoMapper,
            @Value("${minio.bucket}") String bucket) {
        this.documentoRepository = documentoRepository;
        this.alunoRepository = alunoRepository;
        this.minioClient = minioClient;
        this.documentoMapper = documentoMapper;
        this.bucket = bucket;
    }

    @Transactional
    public DocumentoResponse upload(MultipartFile arquivo, UUID alunoId, TipoDocumento tipo) {
        validarAluno(alunoId);
        validarArquivo(arquivo);

        String nomeOriginal = arquivo.getOriginalFilename();
        String chave = gerarChave(alunoId, nomeOriginal);

        try (InputStream inputStream = arquivo.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(chave)
                            .stream(inputStream, arquivo.getSize(), -1L)
                            .contentType(arquivo.getContentType())
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer upload do arquivo no MinIO: " + e.getMessage(), e);
        }

        Documento documento = new Documento();
        documento.setAlunoId(alunoId);
        documento.setNomeArquivo(nomeOriginal);
        documento.setTipoConteudo(arquivo.getContentType());
        documento.setTamanhoBytes(Long.valueOf(arquivo.getSize()));
        documento.setChaveMinio(chave);
        documento.setTipoDocumento(tipo);
        documento.setDataUpload(LocalDateTime.now());

        Documento salvo = documentoRepository.save(documento);
        return documentoMapper.paraResponse(salvo);
    }

    @Transactional(readOnly = true)
    public DocumentoResponse buscarPorId(UUID id) {
        return documentoMapper.paraResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public InputStream download(UUID id) {
        Documento documento = buscarEntidade(id);

        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(documento.getChaveMinio())
                            .build()
            );
        } catch (MinioException e) {
            throw new RuntimeException("Erro ao baixar arquivo do MinIO: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Erro inesperado ao baixar arquivo: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<DocumentoResponse> listar(Pageable pageable, UUID alunoId, TipoDocumento tipo) {
        Page<Documento> page;
        if (alunoId != null && tipo != null) {
            page = documentoRepository.findByAlunoIdAndTipoDocumento(alunoId, tipo, pageable);
        } else if (alunoId != null) {
            page = documentoRepository.findByAlunoId(alunoId, pageable);
        } else {
            page = documentoRepository.findAll(pageable);
        }
        return page.map(documentoMapper::paraResponse);
    }

    @Transactional
    public void remover(UUID id) {
        Documento documento = buscarEntidade(id);

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(documento.getChaveMinio())
                            .build()
            );
        } catch (MinioException e) {
            throw new RuntimeException("Erro ao remover arquivo do MinIO: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Erro inesperado ao remover arquivo: " + e.getMessage(), e);
        }

        documentoRepository.delete(documento);
    }

    private Documento buscarEntidade(UUID id) {
        return documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Documento não encontrado"));
    }

    private void validarAluno(UUID alunoId) {
        if (!alunoRepository.existsById(alunoId)) {
            throw new RecursoNaoEncontradoException("Aluno não encontrado");
        }
    }

    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo não pode ser vazio");
        }
    }

    private String gerarChave(UUID alunoId, String nomeOriginal) {
        String uuid = UUID.randomUUID().toString();
        return String.format(CHAVE_PADRAO, alunoId, uuid, nomeOriginal);
    }
}
