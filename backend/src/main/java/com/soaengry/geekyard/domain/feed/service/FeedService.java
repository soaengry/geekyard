package com.soaengry.geekyard.domain.feed.service;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.exception.AnimeErrorCode;
import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.anime.repository.AnimeRepository;
import com.soaengry.geekyard.domain.feed.dto.request.CreateFeedRequest;
import com.soaengry.geekyard.domain.feed.dto.request.UpdateFeedRequest;
import com.soaengry.geekyard.domain.feed.dto.response.FeedResponse;
import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.feed.entity.FeedBookmark;
import com.soaengry.geekyard.domain.feed.entity.FeedLike;
import com.soaengry.geekyard.domain.feed.exception.FeedErrorCode;
import com.soaengry.geekyard.domain.feed.exception.FeedException;
import com.soaengry.geekyard.domain.feed.repository.FeedBookmarkRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedCommentRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedLikeRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.dto.BookmarkResponse;
import com.soaengry.geekyard.global.common.dto.LikeResponse;
import com.soaengry.geekyard.global.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedService {

    private static final int MAX_IMAGES = 4;

    private final FeedRepository feedRepository;
    private final FeedLikeRepository feedLikeRepository;
    private final FeedBookmarkRepository feedBookmarkRepository;
    private final FeedCommentRepository feedCommentRepository;
    private final AnimeRepository animeRepository;
    private final S3Service s3Service;

    public Page<FeedResponse> getFeeds(Long animeId, Pageable pageable, User user) {
        Page<Feed> feeds = animeId != null
                ? feedRepository.findByAnimeIdWithDetails(animeId, pageable)
                : feedRepository.findAllWithDetails(pageable);

        List<Long> feedIds = feeds.getContent().stream().map(Feed::getId).collect(Collectors.toList());
        Set<Long> likedIds = user != null
                ? Set.copyOf(feedLikeRepository.findLikedFeedIdsByUserAndFeedIds(user, feedIds))
                : Collections.emptySet();
        Set<Long> bookmarkedIds = user != null
                ? Set.copyOf(feedBookmarkRepository.findBookmarkedFeedIdsByUserAndFeedIds(user, feedIds))
                : Collections.emptySet();

        return feeds.map(feed -> FeedResponse.from(feed, likedIds.contains(feed.getId()), bookmarkedIds.contains(feed.getId())));
    }

    public FeedResponse getFeed(Long feedId, User user) {
        Feed feed = findFeedOrThrow(feedId);
        boolean liked = user != null && feedLikeRepository.existsByFeedAndUser(feed, user);
        boolean bookmarked = user != null && feedBookmarkRepository.existsByFeedAndUser(feed, user);
        return FeedResponse.from(feed, liked, bookmarked);
    }

    @Transactional
    public FeedResponse createFeed(User user, CreateFeedRequest request, List<MultipartFile> files) throws IOException {
        Anime anime = null;
        if (request.animeId() != null) {
            anime = animeRepository.findById(request.animeId())
                    .orElseThrow(() -> new AnimeException(AnimeErrorCode.ANIME_NOT_FOUND));
        }

        List<String> imageUrls = uploadImages(files, user.getId());

        Feed feed = Feed.create(user, anime, request.content(), imageUrls);
        feedRepository.save(feed);
        return FeedResponse.from(feed, false, false);
    }

    @Transactional
    public FeedResponse updateFeed(Long feedId, User user, UpdateFeedRequest request, List<MultipartFile> files) throws IOException {
        Feed feed = findFeedOrThrow(feedId);
        validateOwner(feed, user);

        List<String> imageUrls = feed.getImageUrls();
        if (files != null && !files.isEmpty()) {
            for (String url : feed.getImageUrls()) {
                s3Service.delete(url);
            }
            imageUrls = uploadImages(files, user.getId());
        }

        feed.update(request.content(), imageUrls);
        boolean liked = feedLikeRepository.existsByFeedAndUser(feed, user);
        boolean bookmarked = feedBookmarkRepository.existsByFeedAndUser(feed, user);
        return FeedResponse.from(feed, liked, bookmarked);
    }

    @Transactional
    public void deleteFeed(Long feedId, User user) {
        Feed feed = findFeedOrThrow(feedId);
        validateOwner(feed, user);
        for (String url : feed.getImageUrls()) {
            s3Service.delete(url);
        }
        feedLikeRepository.deleteByFeed(feed);
        feedBookmarkRepository.deleteByFeed(feed);
        feedCommentRepository.deleteByFeed(feed);
        feedRepository.delete(feed);
    }

    @Transactional
    public LikeResponse toggleLike(Long feedId, User user) {
        Feed feed = findFeedOrThrow(feedId);
        return feedLikeRepository.findByFeedAndUser(feed, user)
                .map(like -> {
                    feedLikeRepository.delete(like);
                    feedRepository.decrementLikeCount(feed.getId());
                    return new LikeResponse(false, feed.getLikeCount() - 1);
                })
                .orElseGet(() -> {
                    try {
                        feedLikeRepository.save(FeedLike.create(feed, user));
                    } catch (DataIntegrityViolationException e) {
                        return new LikeResponse(true, feed.getLikeCount());
                    }
                    feedRepository.incrementLikeCount(feed.getId());
                    return new LikeResponse(true, feed.getLikeCount() + 1);
                });
    }

    @Transactional
    public BookmarkResponse toggleBookmark(Long feedId, User user) {
        Feed feed = findFeedOrThrow(feedId);
        return feedBookmarkRepository.findByFeedAndUser(feed, user)
                .map(bookmark -> {
                    feedBookmarkRepository.delete(bookmark);
                    return new BookmarkResponse(false);
                })
                .orElseGet(() -> {
                    try {
                        feedBookmarkRepository.save(FeedBookmark.create(feed, user));
                    } catch (DataIntegrityViolationException e) {
                        return new BookmarkResponse(true);
                    }
                    return new BookmarkResponse(true);
                });
    }

    private List<String> uploadImages(List<MultipartFile> files, Long userId) throws IOException {
        List<String> urls = new ArrayList<>();
        if (files == null) return urls;
        for (int i = 0; i < Math.min(files.size(), MAX_IMAGES); i++) {
            MultipartFile file = files.get(i);
            if (file != null && !file.isEmpty()) {
                urls.add(s3Service.upload(file, userId, "feeds"));
            }
        }
        return urls;
    }

    private Feed findFeedOrThrow(Long feedId) {
        return feedRepository.findById(feedId)
                .orElseThrow(() -> new FeedException(FeedErrorCode.FEED_NOT_FOUND));
    }

    private void validateOwner(Feed feed, User user) {
        if (!feed.getUser().getId().equals(user.getId())) {
            throw new FeedException(FeedErrorCode.FEED_UNAUTHORIZED);
        }
    }
}
