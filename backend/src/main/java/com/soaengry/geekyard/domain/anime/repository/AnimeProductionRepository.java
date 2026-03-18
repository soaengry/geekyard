package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeProduction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimeProductionRepository extends JpaRepository<AnimeProduction, Long > {
}
