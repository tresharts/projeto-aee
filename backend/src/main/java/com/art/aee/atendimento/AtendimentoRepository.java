package com.art.aee.atendimento;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

public interface AtendimentoRepository extends JpaRepository<Atendimento, UUID> {

    Page<Atendimento> findByAlunoId(UUID alunoId, Pageable pageable);

    Page<Atendimento> findByAlunoIdAndDataHoraBetween(UUID alunoId, LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    Page<Atendimento> findByAlunoIdAndDataHoraGreaterThanEqual(UUID alunoId, LocalDateTime inicio, Pageable pageable);

    Page<Atendimento> findByAlunoIdAndDataHoraLessThanEqual(UUID alunoId, LocalDateTime fim, Pageable pageable);

    Page<Atendimento> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    Page<Atendimento> findByDataHoraGreaterThanEqual(LocalDateTime inicio, Pageable pageable);

    Page<Atendimento> findByDataHoraLessThanEqual(LocalDateTime fim, Pageable pageable);

    Page<Atendimento> findByAlunoIdIn(List<UUID> alunoIds, Pageable pageable);

    Page<Atendimento> findByAlunoIdInAndDataHoraBetween(List<UUID> alunoIds, LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    Page<Atendimento> findByAlunoIdInAndDataHoraGreaterThanEqual(List<UUID> alunoIds, LocalDateTime inicio, Pageable pageable);

    Page<Atendimento> findByAlunoIdInAndDataHoraLessThanEqual(List<UUID> alunoIds, LocalDateTime fim, Pageable pageable);
}
