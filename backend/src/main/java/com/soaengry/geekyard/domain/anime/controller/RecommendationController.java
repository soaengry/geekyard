package com.soaengry.geekyard.domain.anime.controller;

import com.soaengry.geekyard.domain.anime.dto.request.GenrePreferenceRequest;
import com.soaengry.geekyard.domain.anime.dto.response.RecommendationResponse;
import com.soaengry.geekyard.domain.anime.service.RecommendationService;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PutMapping("/genres")
    @ApiSuccessCode(SuccessCode.GENRE_PREFERENCES_SAVED)
    public void saveGenrePreferences(@AuthenticationPrincipal User user,
                                     @Valid @RequestBody GenrePreferenceRequest request) {
        recommendationService.saveGenrePreferences(user, request);
    }

    @GetMapping("/genres")
    @ApiSuccessCode(SuccessCode.GENRE_PREFERENCES)
    public List<String> getGenrePreferences(@AuthenticationPrincipal User user) {
        return recommendationService.getGenrePreferences(user);
    }

    @GetMapping("/genres/exists")
    @ApiSuccessCode(SuccessCode.OK)
    public Map<String, Boolean> checkGenrePreferencesExist(@AuthenticationPrincipal User user) {
        return Map.of("exists", recommendationService.hasGenrePreferences(user));
    }

    @GetMapping
    @ApiSuccessCode(SuccessCode.RECOMMENDATION_LIST)
    public List<RecommendationResponse> getRecommendations(@AuthenticationPrincipal User user,
                                                            @RequestParam(defaultValue = "10") int size) {
        return recommendationService.getRecommendations(user, size);
    }
}
