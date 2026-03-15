package com.soaengry.geekyard.domain.animelist.service;

import com.soaengry.geekyard.domain.animelist.entity.AnimeList;
import com.soaengry.geekyard.domain.animelist.entity.AnimeListLike;
import com.soaengry.geekyard.domain.animelist.exception.AnimeListErrorCode;
import com.soaengry.geekyard.domain.animelist.exception.AnimeListException;
import com.soaengry.geekyard.domain.animelist.repository.AnimeListLikeRepository;
import com.soaengry.geekyard.domain.animelist.repository.AnimeListRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.dto.LikeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnimeListInteractionService {

    private final AnimeListRepository animeListRepository;
    private final AnimeListLikeRepository animeListLikeRepository;

    @Transactional
    public LikeResponse toggleLike(Long listId, User user) {
        AnimeList animeList = animeListRepository.findById(listId)
                .orElseThrow(() -> new AnimeListException(AnimeListErrorCode.ANIME_LIST_NOT_FOUND));

        return animeListLikeRepository.findByAnimeListAndUser(animeList, user)
                .map(like -> {
                    animeListLikeRepository.delete(like);
                    animeListRepository.decrementLikeCount(animeList.getId());
                    return new LikeResponse(false, animeList.getLikeCount() - 1);
                })
                .orElseGet(() -> {
                    try {
                        animeListLikeRepository.save(AnimeListLike.create(animeList, user));
                    } catch (DataIntegrityViolationException e) {
                        return new LikeResponse(true, animeList.getLikeCount());
                    }
                    animeListRepository.incrementLikeCount(animeList.getId());
                    return new LikeResponse(true, animeList.getLikeCount() + 1);
                });
    }
}
