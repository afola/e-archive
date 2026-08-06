package com.banque.archives.repository;

import com.banque.archives.entity.RetentionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetentionRuleRepository extends JpaRepository<RetentionRule, String> {

    List<RetentionRule> findByIsActiveTrue();

    Optional<RetentionRule> findByArchiveTypeId(String archiveTypeId);
}
