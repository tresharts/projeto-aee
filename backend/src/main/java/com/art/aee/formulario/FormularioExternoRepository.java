package com.art.aee.formulario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface FormularioExternoRepository extends JpaRepository<FormularioExterno, UUID> {
    Optional<FormularioExterno> findByToken(String token);
    List<FormularioExterno> findByAlunoIdInAndDataRespostaIsNotNullOrderByDataRespostaDesc(List<UUID> alunoIds, Pageable pageable);
}
