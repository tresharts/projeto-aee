package com.art.aee.formulario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FormularioExternoRepository extends JpaRepository<FormularioExterno, UUID> {
    Optional<FormularioExterno> findByToken(String token);
}
