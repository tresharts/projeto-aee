package com.art.aee.escola;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EscolaRepository extends JpaRepository<Escola, UUID> {

    List<Escola> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Optional<Escola> findByNomeIgnoreCase(String nome);
}