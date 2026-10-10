package com.art.aee.atendimento;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.UUID;

public interface AtendimentoRepository extends JpaRepository<Atendimento, UUID> {

    Page<Atendimento> findByAlunoId(UUID alunoId, Pageable pageable);

    Page<Atendimento> findByAlunoIdAndDataHoraBetween(UUID alunoId, LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    Page<Atendimento> findByAlunoIdAndDataHoraGreaterThanEqual(UUID alunoId, LocalDateTime inicio, Pageable pageable);

    Page<Atendimento> findByAlunoIdAndDataHoraLessThanEqual(UUID alunoId, LocalDateTime fim, Pageable pageable);

    Page<Atendimento> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    Page<Atendimento> findByDataHoraGreaterThanEqual(LocalDateTime inicio, Pageable pageable);

    Page<Atendimento> findByDataHoraLessThanEqual(LocalDateTime fim, Pageable pageable);
}
