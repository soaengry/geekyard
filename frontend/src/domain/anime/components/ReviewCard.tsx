import { FC, useState } from "react";
import type { ReviewResponse } from "../types";
import StarRating from "./StarRating";

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
  const [showConfirm, setShowConfirm] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

      <p className="review-date text-xs text-subtle mt-2">
        {formatDate(review.createdAt)}
      </p>

      {/* Delete confirmation dialog */}
      {showConfirm && (
        <div className="delete-confirm mt-3 p-3 rounded-lg bg-error/5 border border-error/20">
          <p className="text-sm text-content mb-2">
            리뷰를 삭제하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDelete();
                setShowConfirm(false);
              }}
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
