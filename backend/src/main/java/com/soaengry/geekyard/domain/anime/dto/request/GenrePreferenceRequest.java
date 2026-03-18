package com.soaengry.geekyard.domain.anime.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record GenrePreferenceRequest(
        @NotNull List<String> genres
) {
}
