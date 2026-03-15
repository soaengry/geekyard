import { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { useAuthStore } from "../../auth/store/useAuthStore";
import {
  getReviews,
  getReviewStats,
  getMyReview,
  createReview,
  updateReview,
  deleteReview,
} from "../api/animeApi";
import type {
  ReviewResponse,
  ReviewStatsResponse,
  PageResponse,
} from "../types";
import StarRating from "./StarRating";
import ReviewCard from "./ReviewCard";

interface ReviewTabProps {
  animeId: number;
  onWatchStatusChange?: () => void;
}

const reviewSchema = z.object({
  score: z
    .number()
    .min(0.5, "별점을 선택해주세요.")
    .max(5, "별점은 5점 이하여야 합니다."),
  content: z
    .string()
    .max(2000, "리뷰는 2000자 이내로 작성해주세요.")
    .optional()
    .default(""),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const ReviewTab: FC<ReviewTabProps> = ({ animeId, onWatchStatusChange }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const [stats, setStats] = useState<ReviewStatsResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [myReview, setMyReview] = useState<ReviewResponse | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { score: 0, content: "" },
  });

  const scoreValue = watch("score");

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, reviewsData] = await Promise.all([
        getReviewStats(animeId),
        getReviews(animeId, 0, 10),
      ]);
      setStats(statsData);
      setReviews(reviewsData.content);
      setPage(0);
      setHasMore(reviewsData.number < reviewsData.totalPages - 1);

      if (isAuthenticated) {
        const myData = await getMyReview(animeId);
        setMyReview(myData);
      }
    } catch {
      toast.error("리뷰를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [animeId, isAuthenticated]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data: PageResponse<ReviewResponse> = await getReviews(
        animeId,
        nextPage,
        10,
      );
      setReviews((prev) => [...prev, ...data.content]);
      setPage(nextPage);
      setHasMore(data.number < data.totalPages - 1);
    } catch {
      toast.error("리뷰를 불러오는데 실패했습니다.");
    } finally {
      setLoadingMore(false);
    }
  };

  const openCreateForm = () => {
    setEditingReview(null);
    reset({ score: 0, content: "" });
    setShowForm(true);
  };

  const openEditForm = (review: ReviewResponse) => {
    setEditingReview(review);
    reset({ score: review.score, content: review.content });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReview(null);
    reset({ score: 0, content: "" });
  };

  const onValidationError = () => {
    const scoreError = errors.score?.message;
    if (scoreError) toast.error(scoreError);
  };

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      if (editingReview) {
        await updateReview(animeId, editingReview.id, data);
        toast.success("리뷰가 수정되었습니다.");
      } else {
        await createReview(animeId, data);
        toast.success("리뷰가 등록되었습니다.");
        onWatchStatusChange?.();
      }
      closeForm();
      fetchInitialData();
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (
          err.response?.data as { status?: { message?: string } }
        )?.status?.message;
        toast.error(msg ?? "리뷰 저장에 실패했습니다.");
      }
    }
  };

  const handleDelete = async (reviewId: number) => {
    try {
      await deleteReview(animeId, reviewId);
      toast.success("리뷰가 삭제되었습니다.");
      fetchInitialData();
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (
          err.response?.data as { status?: { message?: string } }
        )?.status?.message;
        toast.error(msg ?? "리뷰 삭제에 실패했습니다.");
      }
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
      {/* Stats section */}
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
          <form
            onSubmit={(e) => {
              handleSubmit(onSubmit, onValidationError)(e).catch(() => {});
            }}
            className="review-form p-4 rounded-lg bg-background border border-content/10 space-y-4"
          >
            <h3 className="review-form-title text-sm font-bold text-content">
              {editingReview ? "리뷰 수정" : "리뷰 작성"}
            </h3>

            <div className="score-input">
              <div className="flex items-center gap-2">
                <StarRating
                  value={scoreValue}
                  onChange={(v) => setValue("score", v)}
                  size="lg"
                />
                <span className="text-sm font-medium text-content">
                  {scoreValue > 0 ? scoreValue.toFixed(1) : "-"}
                </span>
              </div>
              {errors.score && (
                <p className="text-error text-xs mt-1">
                  {errors.score.message}
                </p>
              )}
            </div>

            <div className="content-input">
              <textarea
                {...register("content")}
                placeholder="리뷰를 작성해주세요..."
                rows={4}
                className="review-textarea w-full px-3 py-2 rounded-lg border border-content/10 bg-surface text-content text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-subtle"
              />
              {errors.content && (
                <p className="text-error text-xs mt-1">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div className="form-actions flex gap-2 justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="cancel-btn px-4 py-2 text-sm rounded-lg bg-content/10 text-content hover:bg-content/20 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-btn px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting
                  ? "저장 중..."
                  : editingReview
                    ? "수정"
                    : "등록"}
              </button>
            </div>
          </form>
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

      {/* Load more */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="load-more-btn w-full py-2.5 text-sm rounded-lg bg-content/5 text-subtle hover:text-content hover:bg-content/10 transition-colors disabled:opacity-50"
        >
          {loadingMore ? "불러오는 중..." : "더보기"}
        </button>
      )}

      {/* Empty state */}
      {reviews.length === 0 && !myReview && (
        <div className="review-empty text-center py-8">
          <p className="text-subtle text-sm">아직 리뷰가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewTab;
