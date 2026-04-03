package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeSimilar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnimeSimilarRepository extends JpaRepository<AnimeSimilar, Long> {

    @Query("SELECT s FROM AnimeSimilar s JOIN FETCH s.similarAnime sa LEFT JOIN FETCH sa.metadata WHERE s.anime.id = :animeId ORDER BY s.similarity DESC")
    List<AnimeSimilar> findByAnimeIdWithSimilarAnime(@Param("animeId") Long animeId);
}
