package com.soaengry.geekyard.domain.animelist.dto.response;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.animelist.entity.AnimeListItem;

public record AnimeListItemResponse(
        Long animeId,
        String animeName,
        String animeImg,
        Integer orderIndex
) {
    public static AnimeListItemResponse from(AnimeListItem item) {
        Anime anime = item.getAnime();
        String img = null;
        if (anime.getMetadata() != null && anime.getMetadata().getImages() != null) {
            img = anime.getMetadata().getImages().stream()
                    .filter(i -> "home_default".equals(i.getOptionName()))
                    .findFirst()
                    .map(i -> i.getImgUrl())
                    .orElse(null);
        }
        return new AnimeListItemResponse(
                anime.getId(),
                anime.getName(),
                img,
                item.getOrderIndex()
        );
    }
}
