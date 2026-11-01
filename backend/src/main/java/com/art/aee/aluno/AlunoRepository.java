package com.art.aee.aluno;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlunoRepository extends JpaRepository<Aluno, UUID>, JpaSpecificationExecutor<Aluno> {

    Page<Aluno> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Optional<Aluno> findByIdAndAtivoTrue(UUID id);

    boolean existsByTurmaId(UUID turmaId);

    Page<Aluno> findByTurmaId(UUID turmaId, Pageable pageable);

    Page<Aluno> findByTurmaIdAndNomeContainingIgnoreCase(UUID turmaId, String nome, Pageable pageable);

    Page<Aluno> findByTurmaIdIn(List<UUID> turmaIds, Pageable pageable);

    Page<Aluno> findByTurmaIdInAndNomeContainingIgnoreCase(List<UUID> turmaIds, String nome, Pageable pageable);

    @Query("select a.id from Aluno a where a.turmaId in :turmaIds")
    List<UUID> findIdsByTurmaIdIn(@Param("turmaIds") List<UUID> turmaIds);
}
