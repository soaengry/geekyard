package com.soaengry.geekyard.domain.anime.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.soaengry.geekyard.domain.anime.dto.AnimeSortType;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeDetailResponse;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeFilterResponse;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeListItemResponse;
import com.soaengry.geekyard.domain.anime.dto.response.SimilarAnimeResponse;
import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.exception.AnimeErrorCode;
import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.anime.repository.AnimeMetadataRepository;
import com.soaengry.geekyard.domain.anime.repository.AnimeRepository;
import com.soaengry.geekyard.domain.anime.repository.AnimeSimilarRepository;
import com.soaengry.geekyard.domain.anime.repository.AnimeWatchRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnimeService {

    private final AnimeRepository animeRepository;
    private final AnimeMetadataRepository animeMetadataRepository;
    private final AnimeWatchRepository animeWatchRepository;
    private final AnimeSimilarRepository animeSimilarRepository;
    private final ObjectMapper objectMapper;

    public AnimeFilterResponse getAnimeFilter() {
        List<String> genres = animeMetadataRepository.findDistinctGenres();
        List<String> tags = animeMetadataRepository.findDistinctTags();
        List<String> years = animeRepository.findDistinctAirYearQuartersDesc();
        return AnimeFilterResponse.from(genres, tags, years);
    }

    public Page<AnimeListItemResponse> searchAnime(
            String q, List<String> genres, List<String> tags, List<String> years,
            String sort, int page, int size) {

        String queryParam = StringUtils.hasText(q) ? q : null;
        String genresJson = (genres != null && !genres.isEmpty()) ? toJsonArray(genres) : null;
        String tagsJson = (tags != null && !tags.isEmpty()) ? toJsonArray(tags) : null;

        boolean hasYears = years != null && !years.isEmpty();
        List<String> yearValues = hasYears ? years : List.of("_");

        AnimeSortType sortType = AnimeSortType.from(sort);
        PageRequest pageable = PageRequest.of(page, size);
        Page<Long> idPage = animeRepository.searchAnimeIds(
                queryParam, genresJson, tagsJson, hasYears, yearValues, sortType, pageable);

        List<Long> ids = idPage.getContent();
        if (ids.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, idPage.getTotalElements());
        }

        List<Anime> animes = animeRepository.findAllByIdWithMetadata(ids);

        // Preserve the order from searchAnimeIds
        Map<Long, Anime> animeMap = animes.stream()
                .collect(Collectors.toMap(Anime::getId, Function.identity()));
        List<AnimeListItemResponse> content = ids.stream()
                .map(animeMap::get)
                .map(AnimeListItemResponse::from)
                .toList();

        return new PageImpl<>(content, pageable, idPage.getTotalElements());
    }

    @Transactional
    public AnimeDetailResponse getAnimeDetail(Long id, User user) {
        Anime anime = animeRepository.findByIdWithMetadata(id)
                .orElseThrow(() -> new AnimeException(AnimeErrorCode.ANIME_NOT_FOUND));
        animeRepository.incrementViewCount(id);
        Boolean watched = user != null ? animeWatchRepository.existsByAnimeAndUser(anime, user) : null;
        return AnimeDetailResponse.from(anime, watched);
    }

    public List<SimilarAnimeResponse> getSimilarAnime(Long animeId) {
        return animeSimilarRepository.findByAnimeIdWithSimilarAnime(animeId).stream()
                .map(SimilarAnimeResponse::from)
                .toList();
    }

    private String toJsonArray(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to serialize JSON array", e);
        }
    }
}
