package com.soaengry.geekyard.domain.user.service;

import com.soaengry.geekyard.domain.anime.entity.AnimeWatch;
import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.anime.repository.AnimeReviewRepository;
import com.soaengry.geekyard.domain.anime.repository.AnimeWatchRepository;
import com.soaengry.geekyard.domain.feed.dto.response.CommentResponse;
import com.soaengry.geekyard.domain.feed.dto.response.FeedResponse;
import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.feed.entity.FeedComment;
import com.soaengry.geekyard.domain.feed.repository.FeedBookmarkRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedCommentLikeRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedCommentRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedLikeRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedRepository;
import com.soaengry.geekyard.domain.user.dto.response.WatchedCalendarResponse;
import com.soaengry.geekyard.domain.user.dto.response.WatchedStatisticsResponse;
import com.soaengry.geekyard.domain.user.dto.response.WatchedStatisticsResponse.MonthlyCount;
import com.soaengry.geekyard.domain.user.dto.response.WatchedStatisticsResponse.GenreRatio;
import com.soaengry.geekyard.domain.user.dto.response.WatchedStatisticsResponse.GenreAvgRating;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserActivityService {

    private final FeedRepository feedRepository;
    private final FeedLikeRepository feedLikeRepository;
    private final FeedBookmarkRepository feedBookmarkRepository;
    private final FeedCommentRepository feedCommentRepository;
    private final FeedCommentLikeRepository feedCommentLikeRepository;
    private final AnimeWatchRepository animeWatchRepository;
    private final AnimeReviewRepository animeReviewRepository;

    public Page<FeedResponse> getMyFeeds(User user, Pageable pageable) {
        Page<Feed> feeds = feedRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return mapFeedsWithStatus(feeds, user);
    }

    public Page<FeedResponse> getLikedFeeds(User user, Pageable pageable) {
        Page<Feed> feeds = feedLikeRepository.findLikedFeedsByUser(user, pageable);
        return mapFeedsWithStatus(feeds, user);
    }

    public Page<FeedResponse> getBookmarkedFeeds(User user, Pageable pageable) {
        Page<Feed> feeds = feedBookmarkRepository.findBookmarkedFeedsByUser(user, pageable);
        return mapFeedsWithStatus(feeds, user);
    }

    public Page<CommentResponse> getMyComments(User user, Pageable pageable) {
        Page<FeedComment> comments = feedCommentRepository.findByUserWithFeed(user, pageable);
        List<Long> commentIds = comments.getContent().stream().map(FeedComment::getId).toList();
        Set<Long> likedIds = commentIds.isEmpty()
                ? Collections.emptySet()
                : Set.copyOf(feedCommentLikeRepository.findLikedCommentIdsByUserAndCommentIds(user, commentIds));
        return comments.map(comment -> CommentResponse.from(comment, likedIds.contains(comment.getId())));
    }

    public Page<FeedResponse> getMyImageFeeds(User user, Pageable pageable) {
        Page<Feed> feeds = feedRepository.findByUserAndImageUrlsNotEmpty(user.getId(), pageable);
        return mapFeedsWithStatus(feeds, user);
    }

    public List<WatchedCalendarResponse> getWatchedCalendar(User user, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.plusMonths(1).atDay(1).atStartOfDay();

        List<AnimeWatch> watches = animeWatchRepository.findByUserAndCreatedAtBetween(user, start, end);
        if (watches.isEmpty()) return List.of();

        List<Long> animeIds = watches.stream().map(w -> w.getAnime().getId()).toList();
        Map<Long, BigDecimal> scoreMap = animeReviewRepository.findByUserAndAnimeIdIn(user, animeIds).stream()
                .collect(Collectors.toMap(r -> r.getAnime().getId(), AnimeReview::getScore));

        return watches.stream()
                .map(w -> WatchedCalendarResponse.from(w, scoreMap.get(w.getAnime().getId())))
                .toList();
    }

    public WatchedStatisticsResponse getWatchedStatistics(User user) {
        List<AnimeWatch> watches = animeWatchRepository.findAllByUserWithAnime(user);

        // Monthly counts (recent 12 months, empty months filled with 0)
        YearMonth now = YearMonth.now();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> monthMap = new LinkedHashMap<>();
        for (int i = 11; i >= 0; i--) {
            monthMap.put(now.minusMonths(i).format(monthFormatter), 0L);
        }
        for (AnimeWatch watch : watches) {
            String key = YearMonth.from(watch.getCreatedAt()).format(monthFormatter);
            monthMap.computeIfPresent(key, (k, v) -> v + 1);
        }
        List<MonthlyCount> monthlyCounts = monthMap.entrySet().stream()
                .map(e -> new MonthlyCount(e.getKey(), e.getValue()))
                .toList();

        // Genre counts
        Map<String, Long> genreCountMap = new LinkedHashMap<>();
        for (AnimeWatch watch : watches) {
            if (watch.getAnime().getMetadata() != null && watch.getAnime().getMetadata().getGenres() != null) {
                for (String genre : watch.getAnime().getMetadata().getGenres()) {
                    genreCountMap.merge(genre, 1L, Long::sum);
                }
            }
        }
        List<GenreRatio> genreRatios = genreCountMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new GenreRatio(e.getKey(), e.getValue()))
                .toList();

        // Genre avg ratings
        List<Long> animeIds = watches.stream().map(w -> w.getAnime().getId()).toList();
        Map<Long, BigDecimal> scoreMap = animeIds.isEmpty()
                ? Map.of()
                : animeReviewRepository.findByUserAndAnimeIdIn(user, animeIds).stream()
                        .collect(Collectors.toMap(r -> r.getAnime().getId(), AnimeReview::getScore));

        Map<String, List<BigDecimal>> genreScores = new LinkedHashMap<>();
        for (AnimeWatch watch : watches) {
            BigDecimal score = scoreMap.get(watch.getAnime().getId());
            if (score == null) continue;
            if (watch.getAnime().getMetadata() != null && watch.getAnime().getMetadata().getGenres() != null) {
                for (String genre : watch.getAnime().getMetadata().getGenres()) {
                    genreScores.computeIfAbsent(genre, k -> new ArrayList<>()).add(score);
                }
            }
        }
        List<GenreAvgRating> genreAvgRatings = genreScores.entrySet().stream()
                .map(e -> {
                    BigDecimal avg = e.getValue().stream()
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(e.getValue().size()), 2, RoundingMode.HALF_UP);
                    return new GenreAvgRating(e.getKey(), avg);
                })
                .sorted((a, b) -> b.avgRating().compareTo(a.avgRating()))
                .toList();

        return new WatchedStatisticsResponse(monthlyCounts, genreRatios, genreAvgRatings);
    }

    private Page<FeedResponse> mapFeedsWithStatus(Page<Feed> feeds, User user) {
        List<Long> feedIds = feeds.getContent().stream().map(Feed::getId).collect(Collectors.toList());
        if (feedIds.isEmpty()) return feeds.map(f -> FeedResponse.from(f, false, false));

        Set<Long> likedIds = Set.copyOf(feedLikeRepository.findLikedFeedIdsByUserAndFeedIds(user, feedIds));
        Set<Long> bookmarkedIds = Set.copyOf(feedBookmarkRepository.findBookmarkedFeedIdsByUserAndFeedIds(user, feedIds));
        return feeds.map(feed -> FeedResponse.from(feed, likedIds.contains(feed.getId()), bookmarkedIds.contains(feed.getId())));
    }
}
