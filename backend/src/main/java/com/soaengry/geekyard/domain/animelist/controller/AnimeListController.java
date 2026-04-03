package com.soaengry.geekyard.domain.animelist.controller;

import com.soaengry.geekyard.domain.animelist.dto.request.AddAnimeListItemRequest;
import com.soaengry.geekyard.domain.animelist.dto.request.CreateAnimeListRequest;
import com.soaengry.geekyard.domain.animelist.dto.request.UpdateAnimeListRequest;
import com.soaengry.geekyard.domain.animelist.dto.response.AnimeListDetailResponse;
import com.soaengry.geekyard.domain.animelist.dto.response.AnimeListItemResponse;
import com.soaengry.geekyard.domain.animelist.dto.response.AnimeListSummaryResponse;
import com.soaengry.geekyard.domain.animelist.dto.response.MyAnimeListResponse;
import com.soaengry.geekyard.domain.animelist.service.AnimeListInteractionService;
import com.soaengry.geekyard.domain.animelist.service.AnimeListService;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import com.soaengry.geekyard.global.common.dto.LikeResponse;
import com.soaengry.geekyard.global.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anime-lists")
@RequiredArgsConstructor
public class AnimeListController {

    private final AnimeListService animeListService;
    private final AnimeListInteractionService animeListInteractionService;

    @GetMapping
    @ApiSuccessCode(SuccessCode.ANIME_COLLECTION_LIST)
    public Page<AnimeListSummaryResponse> getPublicLists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal User user
    ) {
        return animeListService.getPublicLists(PageRequestFactory.of(page, size), user);
    }

    @GetMapping("/me")
    @ApiSuccessCode(SuccessCode.ANIME_COLLECTION_LIST)
    public List<MyAnimeListResponse> getMyLists(
            @AuthenticationPrincipal User user
    ) {
        return animeListService.getMyLists(user);
    }

    @GetMapping("/{id}")
    @ApiSuccessCode(SuccessCode.ANIME_COLLECTION_DETAIL)
    public AnimeListDetailResponse getListDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return animeListService.getListDetail(id, user);
    }

    @PostMapping
    @ApiSuccessCode(SuccessCode.ANIME_COLLECTION_CREATED)
    public AnimeListDetailResponse createList(
            @Valid @RequestBody CreateAnimeListRequest request,
            @AuthenticationPrincipal User user
    ) {
        return animeListService.createList(request, user);
    }

    @PatchMapping("/{id}")
    @ApiSuccessCode(SuccessCode.UPDATED)
    public AnimeListDetailResponse updateList(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAnimeListRequest request,
            @AuthenticationPrincipal User user
    ) {
        return animeListService.updateList(id, request, user);
    }

    @DeleteMapping("/{id}")
    @ApiSuccessCode(SuccessCode.DELETED)
    public Void deleteList(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        animeListService.deleteList(id, user);
        return null;
    }

    @PostMapping("/{id}/items")
    @ApiSuccessCode(SuccessCode.CREATED)
    public AnimeListItemResponse addItem(
            @PathVariable Long id,
            @Valid @RequestBody AddAnimeListItemRequest request,
            @AuthenticationPrincipal User user
    ) {
        return animeListService.addItem(id, request, user);
    }

    @DeleteMapping("/{id}/items/{animeId}")
    @ApiSuccessCode(SuccessCode.DELETED)
    public Void removeItem(
            @PathVariable Long id,
            @PathVariable Long animeId,
            @AuthenticationPrincipal User user
    ) {
        animeListService.removeItem(id, animeId, user);
        return null;
    }

    @PostMapping("/{id}/like")
    @ApiSuccessCode(SuccessCode.OK)
    public LikeResponse toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return animeListInteractionService.toggleLike(id, user);
    }
}
