package com.art.aee.aluno;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, UUID> {

    // Busca aluno por nome, paginado
    List<Aluno> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    // Busca aluno específico se ele estiver ativo
    Optional<Aluno> findByIdAndAtivoTrue(UUID id);

    List<Aluno> findByTurmaEscolaId(@Param("escolaId") UUID escolaId, Pageable pageable);

    List<Aluno> findByTurmaEscolaIdAndNomeContainingIgnoreCase(@Param("escolaId") UUID escolaId, @Param("nome") String nome, Pageable pageable);
}