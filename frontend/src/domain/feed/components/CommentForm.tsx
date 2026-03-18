import { FC, useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  submitting?: boolean;
}

const CommentForm: FC<CommentFormProps> = ({ onSubmit, submitting }) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setContent("");
  };

  return (
    <div className="comment-form flex gap-2 mb-4">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="댓글을 입력하세요..."
        className="comment-input flex-1 px-3 py-2 rounded-lg border border-content/10 bg-surface text-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-subtle"
      />
      <button
        onClick={handleSubmit}
        disabled={submitting || !content.trim()}
        className="comment-submit-btn px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? "..." : "등록"}
      </button>
    </div>
  );
};

export default CommentForm;
