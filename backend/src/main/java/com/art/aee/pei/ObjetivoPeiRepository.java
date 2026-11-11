package com.art.aee.pei;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ObjetivoPeiRepository extends JpaRepository<ObjetivoPei, UUID> {
    List<ObjetivoPei> findByAlunoIdAndAtivoTrueOrderByDataCadastroDesc(UUID alunoId);
    List<ObjetivoPei> findByAlunoIdOrderByDataCadastroDesc(UUID alunoId);
    List<ObjetivoPei> findByIdInAndAlunoIdAndAtivoTrue(List<UUID> ids, UUID alunoId);
}
