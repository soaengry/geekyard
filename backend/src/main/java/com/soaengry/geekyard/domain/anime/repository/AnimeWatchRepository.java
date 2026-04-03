package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.AnimeWatch;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AnimeWatchRepository extends JpaRepository<AnimeWatch, Long> {

    boolean existsByAnimeAndUser(Anime anime, User user);

    Optional<AnimeWatch> findByAnimeAndUser(Anime anime, User user);

    @Query("SELECT w FROM AnimeWatch w JOIN FETCH w.anime a LEFT JOIN FETCH a.metadata " +
            "WHERE w.user = :user AND w.createdAt >= :start AND w.createdAt < :end " +
            "ORDER BY w.createdAt ASC")
    List<AnimeWatch> findByUserAndCreatedAtBetween(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT w FROM AnimeWatch w JOIN FETCH w.anime a LEFT JOIN FETCH a.metadata " +
            "WHERE w.user = :user")
    List<AnimeWatch> findAllByUserWithAnime(@Param("user") User user);
}
