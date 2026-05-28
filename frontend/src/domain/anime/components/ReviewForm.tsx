import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "react-toastify";
import { extractApiError } from "../../../global/utils/extractApiError";
import { createReview, updateReview } from "../api/animeApi";
import type { ReviewResponse } from "../types";
import StarRating from "./StarRating";

interface ReviewFormProps {
  animeId: number;
  editingReview: ReviewResponse | null;
  onSuccess: () => void;
  onCancel: () => void;
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

const ReviewForm: FC<ReviewFormProps> = ({
  animeId,
  editingReview,
  onSuccess,
  onCancel,
  onWatchStatusChange,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      score: editingReview?.score ?? 0,
      content: editingReview?.content ?? "",
    },
  });

  const scoreValue = watch("score");

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
      onSuccess();
    } catch (err) {
      toast.error(extractApiError(err, "리뷰 저장에 실패했습니다."));
    }
  };

  return (
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
          <p className="text-error text-xs mt-1">{errors.score.message}</p>
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
          <p className="text-error text-xs mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="form-actions flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="cancel-btn px-4 py-2 text-sm rounded-lg bg-content/10 text-content hover:bg-content/20 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-btn px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "저장 중..." : editingReview ? "수정" : "등록"}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
