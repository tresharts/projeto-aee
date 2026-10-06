package com.art.aee.turma;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TurmaRepository extends JpaRepository<Turma, UUID> {

    List<Turma> findByEscolaId(UUID escolaId);

    Page<Turma> findByEscolaId(UUID escolaId, Pageable pageable);

    Page<Turma> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Turma> findByEscolaIdAndNomeContainingIgnoreCase(UUID escolaId, String nome, Pageable pageable);
}
