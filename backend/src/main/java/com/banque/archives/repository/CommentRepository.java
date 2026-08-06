package com.banque.archives.repository;

import com.banque.archives.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {

    List<Comment> findByArchiveIdOrderByCreatedAtDesc(String archiveId);

    List<Comment> findByWorkflowIdOrderByCreatedAtDesc(String workflowId);

    List<Comment> findByAuthorIdOrderByCreatedAtDesc(String authorId);

    List<Comment> findByParentId(String parentId);
}
