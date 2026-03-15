package com.soaengry.geekyard.domain.animelist.repository;

import com.soaengry.geekyard.domain.animelist.entity.AnimeList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnimeListRepository extends JpaRepository<AnimeList, Long> {

    @Query(value = "SELECT al FROM AnimeList al JOIN FETCH al.user WHERE al.isPublic = true ORDER BY al.createdAt DESC",
            countQuery = "SELECT COUNT(al) FROM AnimeList al WHERE al.isPublic = true")
    Page<AnimeList> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);

    List<AnimeList> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("UPDATE AnimeList al SET al.likeCount = al.likeCount + 1 WHERE al.id = :id")
    void incrementLikeCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE AnimeList al SET al.likeCount = al.likeCount - 1 WHERE al.id = :id AND al.likeCount > 0")
    void decrementLikeCount(@Param("id") Long id);
}
