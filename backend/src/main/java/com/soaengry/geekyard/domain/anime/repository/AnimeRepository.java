package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AnimeRepository extends JpaRepository<Anime, Long>, AnimeRepositoryCustom {

    @Query("SELECT a FROM Anime a LEFT JOIN FETCH a.metadata WHERE a.id = :id")
    Optional<Anime> findByIdWithMetadata(@Param("id") Long id);

    @Query("SELECT a FROM Anime a LEFT JOIN FETCH a.metadata WHERE a.id IN :ids")
    List<Anime> findAllByIdWithMetadata(@Param("ids") List<Long> ids);

    @Query(value = "SELECT DISTINCT a.air_year_quarter FROM anime a WHERE a.air_year_quarter IS NOT NULL ORDER BY a.air_year_quarter DESC",
            nativeQuery = true)
    List<String> findDistinctAirYearQuartersDesc();

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Anime a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Anime a SET a.reviewCount = a.reviewCount + 1 WHERE a.id = :id")
    void incrementReviewCount(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Anime a SET a.reviewCount = a.reviewCount - 1 WHERE a.id = :id AND a.reviewCount > 0")
    void decrementReviewCount(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Anime a SET a.feedCount = a.feedCount + 1 WHERE a.id = :id")
    void incrementFeedCount(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Anime a SET a.feedCount = a.feedCount - 1 WHERE a.id = :id AND a.feedCount > 0")
    void decrementFeedCount(@Param("id") Long id);

    @Query(value = """
            SELECT a.id FROM anime a
            LEFT JOIN anime_metadata m ON a.id = m.anime_id
            WHERE ARRAY(SELECT jsonb_array_elements_text(m.genres))
                  && ARRAY(SELECT jsonb_array_elements_text(CAST(:genresJson AS jsonb)))
            ORDER BY a.view_count + a.review_count DESC
            LIMIT :size
            """, nativeQuery = true)
    List<Long> findPopularIdsByGenres(@Param("genresJson") String genresJson, @Param("size") int size);
}
