package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AnimeMetadataRepository extends JpaRepository<AnimeMetadata, Long> {

    @Query(value = """
            SELECT DISTINCT genre FROM anime_metadata,
            jsonb_array_elements_text(genres) AS genre
            ORDER BY genre
            """, nativeQuery = true)
    List<String> findDistinctGenres();

    @Query(value = """
            SELECT DISTINCT tag FROM anime_metadata,
            jsonb_array_elements_text(tags) AS tag
            ORDER BY tag
            """, nativeQuery = true)
    List<String> findDistinctTags();
}
