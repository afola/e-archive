package com.banque.archives.repository;

import com.banque.archives.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    Optional<Role> findByCode(String code);

    boolean existsByCode(String code);

    Optional<Role> findByName(String name);
}
