package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.AnimeWatch;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnimeWatchRepository extends JpaRepository<AnimeWatch, Long> {

    boolean existsByAnimeAndUser(Anime anime, User user);

    Optional<AnimeWatch> findByAnimeAndUser(Anime anime, User user);
}
