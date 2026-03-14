package com.soaengry.geekyard.domain.feed.service;

import com.soaengry.geekyard.domain.feed.dto.request.CreateCommentRequest;
import com.soaengry.geekyard.domain.feed.dto.request.UpdateCommentRequest;
import com.soaengry.geekyard.domain.feed.dto.response.CommentResponse;
import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.feed.entity.FeedComment;
import com.soaengry.geekyard.domain.feed.exception.FeedErrorCode;
import com.soaengry.geekyard.domain.feed.exception.FeedException;
import com.soaengry.geekyard.domain.feed.repository.FeedCommentRepository;
import com.soaengry.geekyard.domain.feed.repository.FeedRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedCommentService {

    private final FeedCommentRepository feedCommentRepository;
    private final FeedRepository feedRepository;

    public Page<CommentResponse> getComments(Long feedId, Pageable pageable) {
        return feedCommentRepository.findByFeedIdWithUser(feedId, pageable)
                .map(CommentResponse::from);
    }

    @Transactional
    public CommentResponse createComment(Long feedId, User user, CreateCommentRequest request) {
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new FeedException(FeedErrorCode.FEED_NOT_FOUND));

        FeedComment comment = FeedComment.create(feed, user, request.content());
        feedCommentRepository.save(comment);
        feed.incrementCommentCount();
        return CommentResponse.from(comment);
    }

    @Transactional
    public CommentResponse updateComment(Long feedId, Long commentId, User user, UpdateCommentRequest request) {
        FeedComment comment = findCommentOrThrow(commentId, feedId);
        validateOwner(comment, user);
        comment.update(request.content());
        return CommentResponse.from(comment);
    }

    @Transactional
    public void deleteComment(Long feedId, Long commentId, User user) {
        FeedComment comment = findCommentOrThrow(commentId, feedId);
        validateOwner(comment, user);
        Feed feed = comment.getFeed();
        feedCommentRepository.delete(comment);
        feed.decrementCommentCount();
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
