import { FC } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const StarRating: FC<StarRatingProps> = ({
  value,
  onChange,
  size = "md",
}) => {
  const interactive = !!onChange;
  const sizeClass = SIZE_MAP[size];

  const handleClick = (starIndex: number, isLeftHalf: boolean) => {
    if (!onChange) return;
    const newValue = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
    onChange(newValue);
  };

  return (
    <div className="star-rating inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const fillPercent =
          value >= i + 1 ? 100 : value >= i + 0.5 ? 50 : 0;

        return (
          <div
            key={i}
            className={`star-wrapper relative ${sizeClass} ${interactive ? "cursor-pointer" : ""}`}
          >
            {/* Background star (empty) */}
            <svg
              viewBox="0 0 24 24"
              className="star-empty absolute inset-0 w-full h-full text-content/20"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {/* Filled star (clipped) */}
            <div
              className="star-fill absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-yellow-400"
                fill="currentColor"
                style={{ minWidth: sizeClass.includes("4") ? "16px" : sizeClass.includes("5") ? "20px" : "24px" }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            {/* Click zones */}
            {interactive && (
              <>
                <button
                  type="button"
                  className="star-click-left absolute left-0 top-0 w-1/2 h-full"
                  onClick={() => handleClick(i, true)}
                  aria-label={`${i + 0.5}점`}
                />
                <button
                  type="button"
                  className="star-click-right absolute right-0 top-0 w-1/2 h-full"
                  onClick={() => handleClick(i, false)}
                  aria-label={`${i + 1}점`}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
