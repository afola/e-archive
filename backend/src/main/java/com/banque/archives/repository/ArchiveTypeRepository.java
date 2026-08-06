package com.banque.archives.repository;

import com.banque.archives.entity.ArchiveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArchiveTypeRepository extends JpaRepository<ArchiveType, String> {

    Optional<ArchiveType> findByCode(String code);

    boolean existsByCode(String code);

    List<ArchiveType> findByIsActiveTrue();

    List<ArchiveType> findByCategory(String category);
}
