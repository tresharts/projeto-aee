package com.art.aee.escola;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EscolaRepository extends JpaRepository<Escola, UUID> {

    Page<Escola> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Optional<Escola> findByNomeIgnoreCase(String nome);
}