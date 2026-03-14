package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AnimeRepository extends JpaRepository<Anime, Long> {

    @Query("SELECT a FROM Anime a LEFT JOIN FETCH a.metadata WHERE a.id = :id")
    Optional<Anime> findByIdWithMetadata(@Param("id") Long id);

    @Query(value = """
            SELECT a.id FROM anime a
            JOIN anime_metadata m ON a.id = m.anime_id
            WHERE (:q IS NULL OR REPLACE(a.name, ' ', '') ILIKE '%' || REPLACE(:q, ' ', '') || '%')
              AND (:genresJson IS NULL OR m.genres @> CAST(:genresJson AS jsonb))
              AND (:tagsJson IS NULL OR m.tags @> CAST(:tagsJson AS jsonb))
              AND (:hasYears = false OR a.air_year_quarter IN ( :yearValues ))
            """,
            countQuery = """
            SELECT COUNT(*) FROM anime a
            JOIN anime_metadata m ON a.id = m.anime_id
            WHERE (:q IS NULL OR REPLACE(a.name, ' ', '') ILIKE '%' || REPLACE(:q, ' ', '') || '%')
              AND (:genresJson IS NULL OR m.genres @> CAST(:genresJson AS jsonb))
              AND (:tagsJson IS NULL OR m.tags @> CAST(:tagsJson AS jsonb))
              AND (:hasYears = false OR a.air_year_quarter IN ( :yearValues ))
            """,
            nativeQuery = true)
    Page<Long> searchAnimeIds(
            @Param("q") String q,
            @Param("genresJson") String genresJson,
            @Param("tagsJson") String tagsJson,
            @Param("hasYears") boolean hasYears,
            @Param("yearValues") List<String> yearValues,
            Pageable pageable);

    @Query("SELECT a FROM Anime a LEFT JOIN FETCH a.metadata WHERE a.id IN :ids")
    List<Anime> findAllByIdWithMetadata(@Param("ids") List<Long> ids);

    @Query(value = "SELECT DISTINCT a.air_year_quarter FROM anime a WHERE a.air_year_quarter IS NOT NULL ORDER BY a.air_year_quarter DESC",
            nativeQuery = true)
    List<String> findDistinctAirYearQuartersDesc();
}
