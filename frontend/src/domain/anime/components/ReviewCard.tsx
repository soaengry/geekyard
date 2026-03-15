import { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { toggleReviewLike, toggleReviewBookmark } from "../api/animeApi";
import { formatDate } from "../../../global/utils/formatDate";
import type { ReviewResponse } from "../types";
import StarRating from "./StarRating";
import LikeButton from "../../feed/components/LikeButton";
import BookmarkButton from "../../feed/components/BookmarkButton";

interface ReviewCardProps {
  review: ReviewResponse;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ReviewCard: FC<ReviewCardProps> = ({
  review,
  isOwner,
  onEdit,
  onDelete,
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showConfirm, setShowConfirm] = useState(false);
  const [liked, setLiked] = useState(review.liked);
  const [likeCount, setLikeCount] = useState(review.likeCount);
  const [bookmarked, setBookmarked] = useState(review.bookmarked);

  useEffect(() => {
    setLiked(review.liked);
    setLikeCount(review.likeCount);
    setBookmarked(review.bookmarked);
  }, [review.liked, review.likeCount, review.bookmarked]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info("로그인이 필요합니다.");
      return;
    }
    try {
      const result = await toggleReviewLike(review.animeId, review.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      toast.error("좋아요 처리에 실패했습니다.");
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info("로그인이 필요합니다.");
      return;
    }
    try {
      const result = await toggleReviewBookmark(review.animeId, review.id);
      setBookmarked(result.bookmarked);
    } catch {
      toast.error("북마크 처리에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    await onDelete();
    setShowConfirm(false);
  };

  return (
    <div className="review-card p-4 rounded-lg bg-surface border border-content/10">
      <div className="review-header flex items-center gap-3 mb-3">
        <div className="review-avatar w-9 h-9 rounded-full bg-content/10 overflow-hidden shrink-0">
          {review.profileImage ? (
            <img
              src={review.profileImage}
              alt={review.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-subtle text-sm">
              {review.nickname.charAt(0)}
            </div>
          )}
        </div>
        <div className="review-meta flex-1 min-w-0">
          <p className="review-nickname text-sm font-medium text-content truncate">
            {review.nickname}
          </p>
          <div className="review-score-date flex items-center gap-2 mt-0.5">
            <StarRating value={review.score} size="sm" />
            <span className="text-xs text-subtle">
              {review.score.toFixed(1)}
            </span>
          </div>
        </div>
        {isOwner && (
          <div className="review-actions flex gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="review-edit-btn text-xs text-subtle hover:text-primary transition-colors px-2 py-1"
            >
              수정
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="review-delete-btn text-xs text-subtle hover:text-error transition-colors px-2 py-1"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <p className="review-content text-sm text-content/80 leading-relaxed whitespace-pre-line">
        {review.content}
      </p>

      <div className="review-footer flex items-center justify-between mt-3">
        <div className="review-interactions flex items-center gap-4">
          <LikeButton liked={liked} count={likeCount} onToggle={handleLike} />
          <BookmarkButton bookmarked={bookmarked} onToggle={handleBookmark} />
        </div>
        <p className="review-date text-xs text-subtle">
          {formatDate(review.createdAt, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Delete confirmation dialog */}
      {showConfirm && (
        <div className="delete-confirm mt-3 p-3 rounded-lg bg-error/5 border border-error/20">
          <p className="text-sm text-content mb-2">
            리뷰를 삭제하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="confirm-delete-btn px-3 py-1.5 text-xs rounded-lg bg-error text-white hover:bg-error/90 transition-colors"
            >
              삭제
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="cancel-delete-btn px-3 py-1.5 text-xs rounded-lg bg-content/10 text-content hover:bg-content/20 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
