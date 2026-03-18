package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimeMetadataRepository extends JpaRepository<AnimeMetadata, Long> {
}
