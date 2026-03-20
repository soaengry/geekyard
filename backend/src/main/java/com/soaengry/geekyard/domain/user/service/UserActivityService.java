package com.soaengry.geekyard.domain.user.service;

import com.soaengry.geekyard.domain.feed.dto.response.CommentResponse;
import com.soaengry.geekyard.domain.feed.dto.response.FeedResponse;
import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.feed.entity.FeedComment;
import com.soaengry.geekyard.domain.feed.repository.FeedBookmarkRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedCommentLikeRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedCommentRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedLikeRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
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

    private Page<FeedResponse> mapFeedsWithStatus(Page<Feed> feeds, User user) {
        List<Long> feedIds = feeds.getContent().stream().map(Feed::getId).collect(Collectors.toList());
        if (feedIds.isEmpty()) return feeds.map(f -> FeedResponse.from(f, false, false));

        Set<Long> likedIds = Set.copyOf(feedLikeRepository.findLikedFeedIdsByUserAndFeedIds(user, feedIds));
        Set<Long> bookmarkedIds = Set.copyOf(feedBookmarkRepository.findBookmarkedFeedIdsByUserAndFeedIds(user, feedIds));
        return feeds.map(feed -> FeedResponse.from(feed, likedIds.contains(feed.getId()), bookmarkedIds.contains(feed.getId())));
    }
}
