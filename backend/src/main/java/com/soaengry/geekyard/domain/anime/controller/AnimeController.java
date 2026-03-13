package com.soaengry.geekyard.domain.anime.controller;

import com.soaengry.geekyard.domain.anime.dto.response.AnimeDetailResponse;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeFilterResponse;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeListItemResponse;
import com.soaengry.geekyard.domain.anime.service.AnimeService;
import com.soaengry.geekyard.global.common.ApiResponse;
import com.soaengry.geekyard.global.common.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anime")
@RequiredArgsConstructor
public class AnimeController {

    private final AnimeService animeService;

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<AnimeFilterResponse>> getAnimeFilter() {
        AnimeFilterResponse result = animeService.getAnimeFilter();
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.OK, result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AnimeListItemResponse>>> searchAnime(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<String> genres,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) List<String> years,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<AnimeListItemResponse> result = animeService.searchAnime(q, genres, tags, years, page, size);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.ANIME_LIST, result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnimeDetailResponse>> getAnimeDetail(@PathVariable String id) {
        AnimeDetailResponse result = animeService.getAnimeDetail(id);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.ANIME_DETAIL, result));
    }
}
