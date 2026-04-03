package com.soaengry.geekyard.domain.feed.service;

import com.soaengry.geekyard.domain.feed.dto.CommentSortType;
import com.soaengry.geekyard.domain.feed.dto.request.CreateCommentRequest;
import com.soaengry.geekyard.domain.feed.dto.request.UpdateCommentRequest;
import com.soaengry.geekyard.domain.feed.dto.response.CommentResponse;
import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.feed.entity.FeedComment;
import com.soaengry.geekyard.domain.feed.entity.FeedCommentLike;
import com.soaengry.geekyard.domain.feed.exception.FeedErrorCode;
import com.soaengry.geekyard.domain.feed.exception.FeedException;
import com.soaengry.geekyard.domain.feed.repository.FeedCommentLikeRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedCommentRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.dto.LikeResponse;
import com.soaengry.geekyard.global.util.ToggleHelper;
import lombok.RequiredArgsConstructor;
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
public class FeedCommentService {

    private final FeedCommentRepository feedCommentRepository;
    private final FeedCommentLikeRepository feedCommentLikeRepository;
    private final FeedRepository feedRepository;

    public Page<CommentResponse> getComments(Long feedId, CommentSortType sort, Pageable pageable, User user) {
        Page<FeedComment> comments = sort == CommentSortType.POPULAR
                ? feedCommentRepository.findByFeedIdWithUserByPopular(feedId, pageable)
                : feedCommentRepository.findByFeedIdWithUser(feedId, pageable);

        Set<Long> likedIds = getLikedCommentIds(comments.getContent(), user);

        return comments.map(comment -> CommentResponse.from(comment, likedIds.contains(comment.getId())));
    }

    @Transactional
    public CommentResponse createComment(Long feedId, User user, CreateCommentRequest request) {
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new FeedException(FeedErrorCode.FEED_NOT_FOUND));

        FeedComment comment = FeedComment.create(feed, user, request.content());
        feedCommentRepository.save(comment);
        feedRepository.incrementCommentCount(feed.getId());
        return CommentResponse.from(comment, false);
    }

    @Transactional
    public CommentResponse updateComment(Long feedId, Long commentId, User user, UpdateCommentRequest request) {
        FeedComment comment = findCommentOrThrow(commentId, feedId);
        validateOwner(comment, user);
        comment.update(request.content());

        boolean liked = feedCommentLikeRepository.findByCommentAndUser(comment, user).isPresent();
        return CommentResponse.from(comment, liked);
    }

    @Transactional
    public void deleteComment(Long feedId, Long commentId, User user) {
        FeedComment comment = findCommentOrThrow(commentId, feedId);
        validateOwner(comment, user);
        Feed feed = comment.getFeed();
        feedCommentLikeRepository.deleteByComment(comment);
        feedCommentRepository.delete(comment);
        feedRepository.decrementCommentCount(feed.getId());
    }

    @Transactional
    public LikeResponse toggleCommentLike(Long feedId, Long commentId, User user) {
        FeedComment comment = findCommentOrThrow(commentId, feedId);
        return ToggleHelper.toggleLike(
                () -> feedCommentLikeRepository.findByCommentAndUser(comment, user),
                feedCommentLikeRepository::delete,
                () -> feedCommentLikeRepository.save(FeedCommentLike.create(comment, user)),
                () -> feedCommentRepository.decrementLikeCount(comment.getId()),
                () -> feedCommentRepository.incrementLikeCount(comment.getId()),
                comment.getLikeCount()
        );
    }

    private Set<Long> getLikedCommentIds(List<FeedComment> comments, User user) {
        if (user == null || comments.isEmpty()) return Collections.emptySet();
        List<Long> commentIds = comments.stream().map(FeedComment::getId).toList();
        return Set.copyOf(feedCommentLikeRepository.findLikedCommentIdsByUserAndCommentIds(user, commentIds));
    }

    private FeedComment findCommentOrThrow(Long commentId, Long feedId) {
        FeedComment comment = feedCommentRepository.findById(commentId)
                .orElseThrow(() -> new FeedException(FeedErrorCode.COMMENT_NOT_FOUND));
        if (!comment.getFeed().getId().equals(feedId)) {
            throw new FeedException(FeedErrorCode.COMMENT_NOT_FOUND);
        }
        return comment;
    }

    private void validateOwner(FeedComment comment, User user) {
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new FeedException(FeedErrorCode.COMMENT_UNAUTHORIZED);
        }
    }
}
