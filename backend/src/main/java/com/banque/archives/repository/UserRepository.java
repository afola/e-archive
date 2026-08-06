package com.banque.archives.repository;

import com.banque.archives.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    @EntityGraph(attributePaths = {"role"})
    Optional<User> findByUsernameIgnoreCase(String username);

    @EntityGraph(attributePaths = {"role"})
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByAgencyId(String agencyId);

    List<User> findByRoleId(String roleId);

    List<User> findByIsActiveTrue();

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:roleId IS NULL OR u.role.id = :roleId) " +
           "AND (:agencyId IS NULL OR u.agency.id = :agencyId)")
    List<User> findByFilters(
        @Param("search") String search,
        @Param("roleId") String roleId,
        @Param("agencyId") String agencyId
    );

    @Query("""
        SELECT u
        FROM User u
        JOIN u.role r
        WHERE r.permissions IS NOT NULL
          AND LOWER(r.permissions) LIKE LOWER(CONCAT('%', :permission, '%'))
    """)
    List<User> findByPermission(@Param("permission") String permission);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();
}
