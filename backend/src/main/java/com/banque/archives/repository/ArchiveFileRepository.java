package com.banque.archives.repository;

import com.banque.archives.entity.ArchiveFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArchiveFileRepository extends JpaRepository<ArchiveFile, String> {

    List<ArchiveFile> findByArchiveId(String archiveId);

    List<ArchiveFile> findByArchiveIdAndIsActiveTrue(String archiveId);

    boolean existsByChecksum(String checksum);
}
