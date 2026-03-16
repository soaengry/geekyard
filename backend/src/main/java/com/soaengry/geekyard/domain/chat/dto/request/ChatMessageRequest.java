package com.soaengry.geekyard.domain.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatMessageRequest(
        @NotNull Long animeId,
        @NotBlank String message
) {
}
