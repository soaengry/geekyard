package com.soaengry.geekyard.domain.anime.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.soaengry.geekyard.domain.anime.dto.request.GenrePreferenceRequest;
import com.soaengry.geekyard.domain.anime.dto.response.RecommendationResponse;
import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.UserGenrePreference;
import com.soaengry.geekyard.domain.anime.entity.UserRecommendation;
import com.soaengry.geekyard.domain.anime.repository.AnimeRepository;
import com.soaengry.geekyard.domain.anime.repository.UserGenrePreferenceRepository;
import com.soaengry.geekyard.domain.anime.repository.UserRecommendationRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final UserGenrePreferenceRepository genrePreferenceRepository;
    private final UserRecommendationRepository recommendationRepository;
    private final AnimeRepository animeRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void saveGenrePreferences(User user, GenrePreferenceRequest request) {
        genrePreferenceRepository.deleteByUser(user);
        List<UserGenrePreference> preferences = request.genres().stream()
                .map(genre -> UserGenrePreference.create(user, genre))
                .toList();
        genrePreferenceRepository.saveAll(preferences);
    }

    public List<String> getGenrePreferences(User user) {
        return genrePreferenceRepository.findByUser(user).stream()
                .map(UserGenrePreference::getGenre)
                .toList();
    }

    public boolean hasGenrePreferences(User user) {
        return genrePreferenceRepository.existsByUser(user);
    }

    public List<RecommendationResponse> getRecommendations(User user, int size) {
        List<UserRecommendation> recommendations = recommendationRepository
                .findByUserIdWithAnime(user.getId(), PageRequest.of(0, size));

        if (!recommendations.isEmpty()) {
            return recommendations.stream()
                    .map(RecommendationResponse::from)
                    .toList();
        }

        // Fallback: 장르 선호 기반 인기 애니 조회
        List<String> genres = getGenrePreferences(user);
        if (genres.isEmpty()) {
            return List.of();
        }

        List<Long> ids = animeRepository.findPopularIdsByGenres(toJsonArray(genres), size);
        if (ids.isEmpty()) {
            return List.of();
        }

        Map<Long, Anime> animeMap = animeRepository.findAllByIdWithMetadata(ids).stream()
                .collect(Collectors.toMap(Anime::getId, Function.identity()));

        return ids.stream()
                .map(animeMap::get)
                .filter(Objects::nonNull)
                .map(RecommendationResponse::fromAnime)
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
