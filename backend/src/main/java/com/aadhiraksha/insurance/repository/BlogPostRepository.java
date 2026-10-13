package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    @Query("SELECT b FROM BlogPost b WHERE b.isPublished = true " +
           "AND (:category IS NULL OR CAST(:category AS text) = '' OR LOWER(b.category) = LOWER(CAST(:category AS text))) " +
           "AND (:search IS NULL OR CAST(:search AS text) = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR LOWER(b.summary) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) " +
           "ORDER BY b.publishedAt DESC")
    List<BlogPost> findPublishedPosts(@Param("category") String category, @Param("search") String search);

    Optional<BlogPost> findBySlugAndIsPublishedTrue(String slug);

    Optional<BlogPost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Modifying
    @Query("UPDATE BlogPost b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Query("SELECT DISTINCT b.category FROM BlogPost b WHERE b.isPublished = true ORDER BY b.category ASC")
    List<String> findDistinctCategories();

    @Query("SELECT b FROM BlogPost b " +
           "WHERE (:category IS NULL OR CAST(:category AS text) = '' OR LOWER(b.category) = LOWER(CAST(:category AS text))) " +
           "AND (:search IS NULL OR CAST(:search AS text) = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) " +
           "ORDER BY b.createdAt DESC")
    List<BlogPost> findAllAdminPosts(@Param("category") String category, @Param("search") String search);
}
