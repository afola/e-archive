package com.banque.archives.repository;

import com.banque.archives.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, String> {

    Optional<Location> findByCode(String code);

    boolean existsByCode(String code);

    List<Location> findByAgencyId(String agencyId);

    List<Location> findByIsActiveTrue();

    @Query("SELECT l FROM Location l WHERE " +
           "(:site IS NULL OR l.site = :site) " +
           "AND (:building IS NULL OR l.building = :building) " +
           "AND (:room IS NULL OR l.room = :room)")
    List<Location> findByLocationPath(
        @Param("site") String site,
        @Param("building") String building,
        @Param("room") String room
    );

    @Query("SELECT l FROM Location l WHERE l.currentLoad < l.capacity")
    List<Location> findAvailableLocations();
}
