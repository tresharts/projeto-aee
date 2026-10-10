package com.art.aee.documento;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DocumentoRepository extends JpaRepository<Documento, UUID> {

    Page<Documento> findByAlunoId(UUID alunoId, Pageable pageable);

    Page<Documento> findByAlunoIdAndTipoDocumento(UUID alunoId, TipoDocumento tipo, Pageable pageable);
}
