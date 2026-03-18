package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.UserRecommendation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRecommendationRepository extends JpaRepository<UserRecommendation, Long> {

    @Query("SELECT r FROM UserRecommendation r JOIN FETCH r.anime a LEFT JOIN FETCH a.metadata WHERE r.user.id = :userId ORDER BY r.score DESC")
    List<UserRecommendation> findByUserIdWithAnime(@Param("userId") Long userId, Pageable pageable);
}
