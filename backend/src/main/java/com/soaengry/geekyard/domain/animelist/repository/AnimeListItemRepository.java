package com.soaengry.geekyard.domain.animelist.repository;

import com.soaengry.geekyard.domain.animelist.entity.AnimeListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AnimeListItemRepository extends JpaRepository<AnimeListItem, Long> {

    @Query("SELECT ali FROM AnimeListItem ali JOIN FETCH ali.anime WHERE ali.animeList.id = :animeListId ORDER BY ali.orderIndex ASC")
    List<AnimeListItem> findByAnimeListIdOrderByOrderIndexAsc(@Param("animeListId") Long animeListId);

    Optional<AnimeListItem> findByAnimeListIdAndAnimeId(Long animeListId, Long animeId);

    int countByAnimeListId(Long animeListId);

    void deleteByAnimeListId(Long animeListId);
}
