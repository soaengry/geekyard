package com.soaengry.geekyard.domain.animelist.repository;

import com.soaengry.geekyard.domain.animelist.entity.AnimeList;
import com.soaengry.geekyard.domain.animelist.entity.AnimeListLike;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AnimeListLikeRepository extends JpaRepository<AnimeListLike, Long> {

    Optional<AnimeListLike> findByAnimeListAndUser(AnimeList animeList, User user);

    boolean existsByAnimeListIdAndUserId(Long animeListId, Long userId);

    @Query("SELECT all.animeList.id FROM AnimeListLike all WHERE all.user = :user AND all.animeList.id IN :animeListIds")
    List<Long> findLikedAnimeListIdsByUserAndAnimeListIds(@Param("user") User user, @Param("animeListIds") List<Long> animeListIds);

    void deleteByAnimeListId(Long animeListId);
}
