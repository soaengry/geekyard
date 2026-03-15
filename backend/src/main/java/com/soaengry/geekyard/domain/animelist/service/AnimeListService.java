package com.soaengry.geekyard.domain.animelist.service;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.AnimeMetadata;
import com.soaengry.geekyard.domain.anime.exception.AnimeErrorCode;
import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.anime.repository.AnimeRepository;
import com.soaengry.geekyard.domain.animelist.dto.request.AddAnimeListItemRequest;
import com.soaengry.geekyard.domain.animelist.dto.request.CreateAnimeListRequest;
import com.soaengry.geekyard.domain.animelist.dto.request.UpdateAnimeListRequest;
import com.soaengry.geekyard.domain.animelist.dto.response.AnimeListDetailResponse;
import com.soaengry.geekyard.domain.animelist.dto.response.AnimeListItemResponse;
import com.soaengry.geekyard.domain.animelist.dto.response.AnimeListSummaryResponse;
import com.soaengry.geekyard.domain.animelist.dto.response.MyAnimeListResponse;
import com.soaengry.geekyard.domain.animelist.entity.AnimeList;
import com.soaengry.geekyard.domain.animelist.entity.AnimeListItem;
import com.soaengry.geekyard.domain.animelist.exception.AnimeListErrorCode;
import com.soaengry.geekyard.domain.animelist.exception.AnimeListException;
import com.soaengry.geekyard.domain.animelist.repository.AnimeListItemRepository;
import com.soaengry.geekyard.domain.animelist.repository.AnimeListLikeRepository;
import com.soaengry.geekyard.domain.animelist.repository.AnimeListRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnimeListService {

    private final AnimeListRepository animeListRepository;
    private final AnimeListItemRepository animeListItemRepository;
    private final AnimeListLikeRepository animeListLikeRepository;
    private final AnimeRepository animeRepository;

    public List<MyAnimeListResponse> getMyLists(User user) {
        List<AnimeList> lists = animeListRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return lists.stream()
                .map(al -> MyAnimeListResponse.from(al, animeListItemRepository.countByAnimeListId(al.getId())))
                .toList();
    }

    public Page<AnimeListSummaryResponse> getPublicLists(Pageable pageable, User user) {
        Page<AnimeList> page = animeListRepository.findByIsPublicTrueOrderByCreatedAtDesc(pageable);

        Set<Long> likedIds = user != null
                ? Set.copyOf(animeListLikeRepository.findLikedAnimeListIdsByUserAndAnimeListIds(
                    user, page.getContent().stream().map(AnimeList::getId).toList()))
                : Collections.emptySet();

        return page.map(animeList -> {
            List<AnimeListItem> items = animeListItemRepository.findByAnimeListIdOrderByOrderIndexAsc(animeList.getId());
            List<String> coverImages = extractCoverImages(items);
            return AnimeListSummaryResponse.from(animeList, coverImages, items.size(), likedIds.contains(animeList.getId()));
        });
    }

    public AnimeListDetailResponse getListDetail(Long id, User user) {
        AnimeList animeList = animeListRepository.findById(id)
                .orElseThrow(() -> new AnimeListException(AnimeListErrorCode.ANIME_LIST_NOT_FOUND));

        boolean isOwner = user != null && animeList.getUser().getId().equals(user.getId());

        if (!animeList.getIsPublic() && !isOwner) {
            throw new AnimeListException(AnimeListErrorCode.ANIME_LIST_NOT_FOUND);
        }

        List<AnimeListItem> items = animeListItemRepository.findByAnimeListIdOrderByOrderIndexAsc(id);
        List<AnimeListItemResponse> itemResponses = items.stream()
                .map(AnimeListItemResponse::from)
                .toList();
        List<String> coverImages = extractCoverImages(items);

        boolean liked = user != null && animeListLikeRepository.existsByAnimeListIdAndUserId(id, user.getId());

        return AnimeListDetailResponse.from(animeList, itemResponses, coverImages, liked, isOwner);
    }

    @Transactional
    public AnimeListDetailResponse createList(CreateAnimeListRequest request, User user) {
        AnimeList animeList = AnimeList.create(user, request.title(), request.description(), request.isPublic());
        animeListRepository.save(animeList);
        return AnimeListDetailResponse.from(animeList, List.of(), List.of(), false, true);
    }

    @Transactional
    public AnimeListDetailResponse updateList(Long id, UpdateAnimeListRequest request, User user) {
        AnimeList animeList = findAndValidateOwner(id, user);
        animeList.update(request.title(), request.description(), request.isPublic());

        List<AnimeListItem> items = animeListItemRepository.findByAnimeListIdOrderByOrderIndexAsc(id);
        List<AnimeListItemResponse> itemResponses = items.stream()
                .map(AnimeListItemResponse::from)
                .toList();
        List<String> coverImages = extractCoverImages(items);

        return AnimeListDetailResponse.from(animeList, itemResponses, coverImages, false, true);
    }

    @Transactional
    public void deleteList(Long id, User user) {
        AnimeList animeList = findAndValidateOwner(id, user);
        animeListLikeRepository.deleteByAnimeListId(id);
        animeListItemRepository.deleteByAnimeListId(id);
        animeListRepository.delete(animeList);
    }

    @Transactional
    public AnimeListItemResponse addItem(Long id, AddAnimeListItemRequest request, User user) {
        AnimeList animeList = findAndValidateOwner(id, user);

        Anime anime = animeRepository.findById(request.animeId())
                .orElseThrow(() -> new AnimeException(AnimeErrorCode.ANIME_NOT_FOUND));

        int nextOrder = animeListItemRepository.countByAnimeListId(id);

        try {
            AnimeListItem item = AnimeListItem.create(animeList, anime, nextOrder);
            animeListItemRepository.save(item);
            return AnimeListItemResponse.from(item);
        } catch (DataIntegrityViolationException e) {
            throw new AnimeListException(AnimeListErrorCode.DUPLICATE_ANIME_IN_LIST);
        }
    }

    @Transactional
    public void removeItem(Long id, Long animeId, User user) {
        findAndValidateOwner(id, user);

        AnimeListItem item = animeListItemRepository.findByAnimeListIdAndAnimeId(id, animeId)
                .orElseThrow(() -> new AnimeListException(AnimeListErrorCode.ANIME_LIST_ITEM_NOT_FOUND));

        animeListItemRepository.delete(item);
    }

    private AnimeList findAndValidateOwner(Long id, User user) {
        AnimeList animeList = animeListRepository.findById(id)
                .orElseThrow(() -> new AnimeListException(AnimeListErrorCode.ANIME_LIST_NOT_FOUND));

        if (!animeList.getUser().getId().equals(user.getId())) {
            throw new AnimeListException(AnimeListErrorCode.ANIME_LIST_UNAUTHORIZED);
        }

        return animeList;
    }

    private List<String> extractCoverImages(List<AnimeListItem> items) {
        return items.stream()
                .limit(4)
                .map(item -> {
                    Anime anime = item.getAnime();
                    AnimeMetadata metadata = anime.getMetadata();
                    if (metadata != null && metadata.getImages() != null) {
                        return metadata.getImages().stream()
                                .filter(img -> "home_default".equals(img.getOptionName()))
                                .findFirst()
                                .map(img -> img.getImgUrl())
                                .orElse(null);
                    }
                    return null;
                })
                .filter(img -> img != null)
                .toList();
    }
}
