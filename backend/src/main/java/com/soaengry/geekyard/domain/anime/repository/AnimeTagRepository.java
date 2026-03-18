package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeBrand;
import com.soaengry.geekyard.domain.anime.entity.AnimeTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimeTagRepository extends JpaRepository<AnimeTag, Long > {
}
