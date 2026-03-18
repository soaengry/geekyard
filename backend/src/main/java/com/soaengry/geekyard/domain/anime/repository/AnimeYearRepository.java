package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeTag;
import com.soaengry.geekyard.domain.anime.entity.AnimeYear;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimeYearRepository extends JpaRepository<AnimeYear, Long > {
}
