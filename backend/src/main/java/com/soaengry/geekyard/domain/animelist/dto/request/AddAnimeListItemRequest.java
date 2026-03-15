package com.soaengry.geekyard.domain.animelist.dto.request;

import jakarta.validation.constraints.NotNull;

public record AddAnimeListItemRequest(
        @NotNull(message = "애니메이션 ID는 필수입니다.")
        Long animeId
) {}
