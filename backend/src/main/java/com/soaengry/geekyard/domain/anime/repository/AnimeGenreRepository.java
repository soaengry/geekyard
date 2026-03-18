package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeGenre;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimeGenreRepository extends JpaRepository<AnimeGenre, Long > {
}
