import { FC, useCallback, useEffect, useRef, useState } from "react";
import { usePaginatedData } from "../../../global/hooks/usePaginatedData";
import { useSentinelObserver } from "../../../global/hooks/useSentinelObserver";
import { toast } from "react-toastify";
import { extractApiError } from "../../../global/utils/extractApiError";
import { useAuthStore } from "../../auth/store/useAuthStore";
import {
  getReviews,
  getReviewStats,
  getMyReview,
  deleteReview,
} from "../api/animeApi";
import type { ReviewResponse, ReviewStatsResponse } from "../types";
import StarRating from "./StarRating";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

interface ReviewTabProps {
  animeId: number;
  onWatchStatusChange?: () => void;
}

const ReviewTab: FC<ReviewTabProps> = ({ animeId, onWatchStatusChange }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const [stats, setStats] = useState<ReviewStatsResponse | null>(null);
  const [myReview, setMyReview] = useState<ReviewResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  // 리뷰 작성/수정/삭제 후 목록과 통계를 재조회하기 위한 카운터
  const [refreshCounter, setRefreshCounter] = useState(0);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const reviewFetcher = useCallback(
    (page: number) => getReviews(animeId, page, 10),
    [animeId, refreshCounter], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const { items: reviews, loading, loadingMore, hasMore, loadMore } =
    usePaginatedData(reviewFetcher);

  // 통계 및 내 리뷰는 페이지네이션과 별도로 조회
  useEffect(() => {
    getReviewStats(animeId)
      .then(setStats)
      .catch(() => toast.error("리뷰 통계를 불러오는데 실패했습니다."));

    if (isAuthenticated) {
      getMyReview(animeId)
        .then(setMyReview)
        .catch(() => {});
    }
  }, [animeId, isAuthenticated, refreshCounter]);

  useSentinelObserver({
    sentinelRef,
    hasMore,
    loading: loadingMore || loading,
    onLoadMore: loadMore,
  });

  const openCreateForm = () => {
    setEditingReview(null);
    setShowForm(true);
  };

  const openEditForm = (review: ReviewResponse) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    setRefreshCounter((c) => c + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const handleDelete = async (reviewId: number) => {
    try {
      await deleteReview(animeId, reviewId);
      toast.success("리뷰가 삭제되었습니다.");
      setRefreshCounter((c) => c + 1);
    } catch (err) {
      toast.error(extractApiError(err, "리뷰 삭제에 실패했습니다."));
    }
  };

  if (loading) {
    return (
      <div className="review-tab-loading p-5 space-y-3 animate-pulse">
        <div className="h-16 rounded-lg bg-content/10" />
        <div className="h-24 rounded-lg bg-content/10" />
        <div className="h-24 rounded-lg bg-content/10" />
      </div>
    );
  }

  return (
    <div className="review-tab p-5 space-y-5">
      {/* Stats */}
      {stats && (
        <div className="review-stats flex items-center gap-3 p-4 rounded-lg bg-background border border-content/10">
          <div className="stats-score flex items-center gap-2">
            <StarRating value={stats.averageScore} size="md" />
            <span className="text-lg font-bold text-content">
              {stats.averageScore.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-subtle">
            ({stats.totalCount}개의 리뷰)
          </span>
        </div>
      )}

      {/* My review section */}
      <div className="my-review-section">
        {!isAuthenticated ? (
          <div className="login-prompt p-4 rounded-lg bg-content/5 text-center">
            <p className="text-sm text-subtle">
              리뷰를 작성하려면 로그인해주세요.
            </p>
          </div>
        ) : showForm ? (
          <ReviewForm
            animeId={animeId}
            editingReview={editingReview}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            onWatchStatusChange={onWatchStatusChange}
          />
        ) : myReview ? (
          <div className="my-review">
            <h3 className="my-review-title text-sm font-bold text-content mb-2">
              내 리뷰
            </h3>
            <ReviewCard
              review={myReview}
              isOwner
              onEdit={() => openEditForm(myReview)}
              onDelete={() => handleDelete(myReview.id)}
            />
          </div>
        ) : (
          <button
            onClick={openCreateForm}
            className="write-review-btn w-full p-3 rounded-lg border border-dashed border-content/20 text-sm text-subtle hover:text-primary hover:border-primary/40 transition-colors"
          >
            리뷰 작성하기
          </button>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="review-list space-y-3">
          <h3 className="review-list-title text-sm font-bold text-content">
            리뷰
          </h3>
          {reviews
            .filter((r) => r.id !== myReview?.id)
            .map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwner={currentUser?.id === review.userId}
                onEdit={() => openEditForm(review)}
                onDelete={() => handleDelete(review.id)}
              />
            ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="review-sentinel h-4">
          {loadingMore && (
            <p className="review-loading-more text-center text-subtle text-sm py-2">
              불러오는 중...
            </p>
          )}
        </div>
      )}

      {reviews.length === 0 && !myReview && (
        <div className="review-empty text-center py-8">
          <p className="text-subtle text-sm">아직 리뷰가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewTab;
