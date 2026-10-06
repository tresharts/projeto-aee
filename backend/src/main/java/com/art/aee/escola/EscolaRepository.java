package com.art.aee.escola;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EscolaRepository extends JpaRepository<Escola, UUID> {

    Page<Escola> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Optional<Escola> findByNomeIgnoreCase(String nome);
}