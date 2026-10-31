package com.art.aee.professor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface ProfessorRepository extends JpaRepository<Professor, UUID> {

    Optional<Professor> findByEmail(String email);

    List<Professor> findByAccountStatusAndRoleOrderByNameAsc(AccountStatus accountStatus, Role role);

    List<Professor> findByAccountStatusAndRoleAndEscolaIdOrderByNameAsc(
            AccountStatus accountStatus, Role role, UUID escolaId);

    List<Professor> findByEscolaIdIsNull();
}
