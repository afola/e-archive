package com.banque.archives.repository;

import com.banque.archives.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, String> {

    Optional<Agency> findByCode(String code);

    boolean existsByCode(String code);

    List<Agency> findByIsActiveTrue();

    List<Agency> findByCity(String city);

    List<Agency> findByRegion(String region);
}
