package com.art.aee.sessao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessaoAgendadaRepository extends JpaRepository<SessaoAgendada, UUID> {

    List<SessaoAgendada> findByProfessorIdAndDataHoraGreaterThanEqualAndDataHoraLessThanOrderByDataHoraAsc(
            UUID professorId, LocalDateTime inicio, LocalDateTime fim);

    Optional<SessaoAgendada> findByIdAndProfessorId(UUID id, UUID professorId);

    boolean existsByProfessorIdAndDataHoraAndStatusNot(UUID professorId, LocalDateTime dataHora, SessaoStatus status);

    boolean existsByProfessorIdAndDataHoraAndStatusNotAndIdNot(
            UUID professorId, LocalDateTime dataHora, SessaoStatus status, UUID id);
}
