package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.model.BlogPost;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.BlogPostRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Blog & SEO Knowledge Hub", description = "Public and Admin endpoints for insurance guides and articles")
public class BlogController {

    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9-]");
    private static final Pattern MULTI_DASH = Pattern.compile("-+");

    // ==========================================
    // PUBLIC ENDPOINTS (SEO & Content Readers)
    // ==========================================

    @GetMapping("/blogs")
    @Operation(summary = "Get list of published blog posts for public SEO hub")
    public ResponseEntity<List<BlogPost>> getPublishedBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        String cleanCat = (category != null && !category.isBlank()) ? category.trim() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return ResponseEntity.ok(blogPostRepository.findPublishedPosts(cleanCat, cleanSearch));
    }

    @GetMapping("/blogs/categories")
    @Operation(summary = "Get distinct categories with published posts")
    public ResponseEntity<List<String>> getBlogCategories() {
        return ResponseEntity.ok(blogPostRepository.findDistinctCategories());
    }

    @GetMapping("/blogs/{slug}")
    @Transactional
    @Operation(summary = "Get a single blog post by slug and increment view count")
    public ResponseEntity<BlogPost> getBlogBySlug(@PathVariable String slug) {
        BlogPost post = blogPostRepository.findBySlugAndIsPublishedTrue(slug)
                .orElseThrow(() -> new IllegalArgumentException("Article not found or not currently published with slug: " + slug));
        
        try {
            blogPostRepository.incrementViewCount(post.getId());
            post.setViewCount(post.getViewCount() + 1);
        } catch (Exception ex) {
            // Non-blocking view count tracking
        }
        
        return ResponseEntity.ok(post);
    }

    // ==========================================
    // ADMIN ENDPOINTS (Staff & Super Admin)
    // ==========================================

    @GetMapping("/admin/blogs")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF', 'ROLE_EMPLOYEE')")
    @Operation(summary = "List all blogs (drafts and published) for CRM manager")
    public ResponseEntity<List<BlogPost>> getAllBlogsForAdmin(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        String cleanCat = (category != null && !category.isBlank()) ? category.trim() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return ResponseEntity.ok(blogPostRepository.findAllAdminPosts(cleanCat, cleanSearch));
    }

    @PostMapping("/admin/blogs")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Create a new blog post (Super Admin / Manager)")
    public ResponseEntity<BlogPost> createBlogPost(@Valid @RequestBody BlogPost post, Authentication auth) {
        if (post.getSlug() == null || post.getSlug().isBlank()) {
            post.setSlug(generateSlug(post.getTitle()));
        } else {
            post.setSlug(generateSlug(post.getSlug()));
        }

        if (blogPostRepository.existsBySlug(post.getSlug())) {
            post.setSlug(post.getSlug() + "-" + System.currentTimeMillis() % 10000);
        }

        if (Boolean.TRUE.equals(post.getIsPublished()) && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }

        BlogPost saved = blogPostRepository.save(post);

        User user = (auth != null && auth.getName() != null) ? userRepository.findByEmail(auth.getName()).orElse(null) : null;
        auditService.logAction("BLOG_POST", saved.getId(), "CREATE", "ALL", null, "Created blog post: " + saved.getTitle(), user, null);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/admin/blogs/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Update an existing blog post (Super Admin / Manager)")
    public ResponseEntity<BlogPost> updateBlogPost(@PathVariable Long id, @Valid @RequestBody BlogPost updatedData, Authentication auth) {
        BlogPost existing = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog post not found with ID: " + id));

        existing.setTitle(updatedData.getTitle());
        if (updatedData.getSlug() != null && !updatedData.getSlug().isBlank()) {
            String cleanSlug = generateSlug(updatedData.getSlug());
            if (!cleanSlug.equals(existing.getSlug()) && blogPostRepository.existsBySlug(cleanSlug)) {
                cleanSlug = cleanSlug + "-" + System.currentTimeMillis() % 10000;
            }
            existing.setSlug(cleanSlug);
        }
        existing.setSummary(updatedData.getSummary());
        existing.setContent(updatedData.getContent());
        existing.setCategory(updatedData.getCategory());
        existing.setCoverImageUrl(updatedData.getCoverImageUrl());
        existing.setAuthorName(updatedData.getAuthorName());
        existing.setReadTimeMinutes(updatedData.getReadTimeMinutes());
        existing.setMetaTitle(updatedData.getMetaTitle());
        existing.setMetaDescription(updatedData.getMetaDescription());

        if (updatedData.getIsPublished() != null) {
            if (Boolean.TRUE.equals(updatedData.getIsPublished()) && !Boolean.TRUE.equals(existing.getIsPublished())) {
                existing.setPublishedAt(LocalDateTime.now());
            }
            existing.setIsPublished(updatedData.getIsPublished());
        }

        BlogPost saved = blogPostRepository.save(existing);

        User user = (auth != null && auth.getName() != null) ? userRepository.findByEmail(auth.getName()).orElse(null) : null;
        auditService.logAction("BLOG_POST", saved.getId(), "UPDATE", "ALL", null, "Updated blog post: " + saved.getTitle(), user, null);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/admin/blogs/{id}/toggle-publish")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Toggle publish/draft status of a blog post")
    public ResponseEntity<BlogPost> togglePublishStatus(@PathVariable Long id, Authentication auth) {
        BlogPost existing = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog post not found with ID: " + id));

        boolean oldStatus = Boolean.TRUE.equals(existing.getIsPublished());
        boolean newStatus = !oldStatus;
        existing.setIsPublished(newStatus);
        if (newStatus && existing.getPublishedAt() == null) {
            existing.setPublishedAt(LocalDateTime.now());
        }

        BlogPost saved = blogPostRepository.save(existing);

        User user = (auth != null && auth.getName() != null) ? userRepository.findByEmail(auth.getName()).orElse(null) : null;
        auditService.logAction("BLOG_POST", saved.getId(), newStatus ? "PUBLISH" : "UNPUBLISH", "IS_PUBLISHED",
                String.valueOf(oldStatus), String.valueOf(newStatus), user, null);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/admin/blogs/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Delete a blog post permanently (Super Admin only)")
    public ResponseEntity<?> deleteBlogPost(@PathVariable Long id, Authentication auth) {
        BlogPost existing = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog post not found with ID: " + id));

        blogPostRepository.delete(existing);

        User user = (auth != null && auth.getName() != null) ? userRepository.findByEmail(auth.getName()).orElse(null) : null;
        auditService.logAction("BLOG_POST", id, "DELETE", "ALL", existing.getTitle(), null, user, null);

        return ResponseEntity.ok().build();
    }

    private String generateSlug(String input) {
        if (input == null) return "article";
        String normalized = input.trim().toLowerCase();
        normalized = NON_ALPHANUMERIC.matcher(normalized).replaceAll("-");
        normalized = MULTI_DASH.matcher(normalized).replaceAll("-");
        normalized = normalized.replaceAll("^-|-$", "");
        return normalized.isBlank() ? "article" : normalized;
    }
}
