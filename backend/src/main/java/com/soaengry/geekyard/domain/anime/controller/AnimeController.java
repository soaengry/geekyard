package com.soaengry.geekyard.domain.anime.controller;

import com.soaengry.geekyard.domain.anime.dto.response.AnimeDetailResponse;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeFilterResponse;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeListItemResponse;
import com.soaengry.geekyard.domain.anime.dto.response.SimilarAnimeResponse;
import com.soaengry.geekyard.domain.anime.dto.response.WatchResponse;
import com.soaengry.geekyard.domain.anime.service.AnimeService;
import com.soaengry.geekyard.domain.anime.service.AnimeWatchService;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anime")
@RequiredArgsConstructor
public class AnimeController {

    private final AnimeService animeService;
    private final AnimeWatchService animeWatchService;

    @GetMapping("/filter")
    @ApiSuccessCode(SuccessCode.OK)
    public AnimeFilterResponse getAnimeFilter() {
        return animeService.getAnimeFilter();
    }

    @GetMapping
    @ApiSuccessCode(SuccessCode.ANIME_LIST)
    public Page<AnimeListItemResponse> searchAnime(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<String> genres,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) List<String> years,
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return animeService.searchAnime(q, genres, tags, years, sort, page, size);
    }

    @GetMapping("/{id}")
    @ApiSuccessCode(SuccessCode.ANIME_DETAIL)
    public AnimeDetailResponse getAnimeDetail(@PathVariable Long id,
                                               @AuthenticationPrincipal User user) {
        return animeService.getAnimeDetail(id, user);
    }

    @GetMapping("/{id}/similar")
    @ApiSuccessCode(SuccessCode.SIMILAR_ANIME_LIST)
    public List<SimilarAnimeResponse> getSimilarAnime(@PathVariable Long id) {
        return animeService.getSimilarAnime(id);
    }

    @PostMapping("/{id}/watch")
    @ApiSuccessCode(SuccessCode.OK)
    public WatchResponse toggleWatch(@PathVariable Long id,
                                     @AuthenticationPrincipal User user) {
        return animeWatchService.toggleWatch(id, user);
    }
}
