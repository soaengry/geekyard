package com.soaengry.geekyard.domain.anime.service;

import com.soaengry.geekyard.domain.anime.dto.response.WatchResponse;
import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.AnimeWatch;
import com.soaengry.geekyard.domain.anime.exception.AnimeErrorCode;
import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.anime.repository.AnimeRepository;
import com.soaengry.geekyard.domain.anime.repository.AnimeWatchRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnimeWatchService {

    private final AnimeWatchRepository animeWatchRepository;
    private final AnimeRepository animeRepository;

    @Transactional
    public WatchResponse toggleWatch(Long animeId, User user) {
        Anime anime = animeRepository.findById(animeId)
                .orElseThrow(() -> new AnimeException(AnimeErrorCode.ANIME_NOT_FOUND));

        return animeWatchRepository.findByAnimeAndUser(anime, user)
                .map(watch -> {
                    animeWatchRepository.delete(watch);
                    return new WatchResponse(false);
                })
                .orElseGet(() -> {
                    try {
                        animeWatchRepository.save(AnimeWatch.create(anime, user));
                    } catch (DataIntegrityViolationException e) {
                        return new WatchResponse(true);
                    }
                    return new WatchResponse(true);
                });
    }

    @Transactional
    public void markWatchedIfNot(Anime anime, User user) {
        if (!animeWatchRepository.existsByAnimeAndUser(anime, user)) {
            try {
                animeWatchRepository.save(AnimeWatch.create(anime, user));
            } catch (DataIntegrityViolationException e) {
                // already exists — race condition, ignore
            }
        }
    }
}
