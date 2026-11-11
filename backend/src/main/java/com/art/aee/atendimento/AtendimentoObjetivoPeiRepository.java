package com.art.aee.atendimento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AtendimentoObjetivoPeiRepository extends JpaRepository<AtendimentoObjetivoPei, UUID> {
    List<AtendimentoObjetivoPei> findByAtendimentoId(UUID atendimentoId);
    List<AtendimentoObjetivoPei> findByAtendimentoIdIn(List<UUID> atendimentoIds);
    void deleteByAtendimentoId(UUID atendimentoId);
}
