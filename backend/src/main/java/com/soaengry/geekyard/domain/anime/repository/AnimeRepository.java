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

    @Modifying
    @Query("UPDATE Anime a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Anime a SET a.reviewCount = a.reviewCount + 1 WHERE a.id = :id")
    void incrementReviewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Anime a SET a.reviewCount = a.reviewCount - 1 WHERE a.id = :id AND a.reviewCount > 0")
    void decrementReviewCount(@Param("id") Long id);
}
