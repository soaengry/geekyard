package com.soaengry.geekyard.domain.user.dto.response;

import com.soaengry.geekyard.domain.anime.entity.AnimeWatch;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WatchedCalendarResponse(
        LocalDate date,
        Long animeId,
        String animeName,
        String animeImg,
        BigDecimal score
) {
    public static WatchedCalendarResponse from(AnimeWatch watch, BigDecimal score) {
        String animeImg = null;
        if (watch.getAnime().getMetadata() != null && watch.getAnime().getMetadata().getImages() != null) {
            animeImg = watch.getAnime().getMetadata().getImages().stream()
                    .filter(img -> "home_default".equals(img.getOptionName()))
                    .findFirst()
                    .map(img -> img.getImgUrl())
                    .orElse(null);
        }
        return new WatchedCalendarResponse(
                watch.getCreatedAt().toLocalDate(),
                watch.getAnime().getId(),
                watch.getAnime().getName(),
                animeImg,
                score
        );
    }
}
