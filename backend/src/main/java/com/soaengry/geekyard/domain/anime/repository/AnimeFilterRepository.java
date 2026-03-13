package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeFilter;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AnimeFilterRepository extends MongoRepository<AnimeFilter, String> {
}
