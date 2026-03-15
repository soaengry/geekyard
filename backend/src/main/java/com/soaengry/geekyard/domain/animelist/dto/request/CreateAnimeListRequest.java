package com.soaengry.geekyard.domain.animelist.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAnimeListRequest(
        @NotBlank(message = "리스트 제목은 필수입니다.")
        @Size(max = 100, message = "리스트 제목은 100자 이내로 작성해주세요.")
        String title,

        @Size(max = 2000, message = "리스트 설명은 2000자 이내로 작성해주세요.")
        String description,

        Boolean isPublic
) {}
