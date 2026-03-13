import { FC, useEffect, useRef, useState } from "react";
import { CheckItem } from "./AnimeSidebar";

interface AccordionSectionProps {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  defaultOpen?: boolean;
}

const AccordionSection: FC<AccordionSectionProps> = ({
  title,
  items,
  selected,
  onToggle,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [items]);

  if (items.length === 0) return null;

  const selectedCount = selected.filter((s) => items.includes(s)).length;

  return (
    <div className="accordion-section border-b border-content/10">
      <button
        className="accordion-header flex items-center justify-between w-full py-3 px-4 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="accordion-title text-sm font-bold text-content">
          {title}
          {selectedCount > 0 && (
            <span className="accordion-count ml-1.5 text-xs font-medium text-primary">
              {selectedCount}
            </span>
          )}
        </span>
        <svg
          className={`accordion-chevron w-4 h-4 text-subtle transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className="accordion-body overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: open ? height : 0 }}
      >
        <div ref={contentRef} className="accordion-items px-4 pb-3 space-y-0.5">
          {items.map((item) => (
            <CheckItem
              key={item}
              label={item}
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  availableGenres: string[];
  availableTags: string[];
  availableYears: string[];
  selectedGenres: string[];
  selectedTags: string[];
  selectedYears: string[];
  onGenreToggle: (genre: string) => void;
  onTagToggle: (tag: string) => void;
  onYearToggle: (year: string) => void;
  onClear: () => void;
}

const MobileFilterDrawer: FC<MobileFilterDrawerProps> = ({
  open,
  onClose,
  availableGenres,
  availableTags,
  availableYears,
  selectedGenres,
  selectedTags,
  selectedYears,
  onGenreToggle,
  onTagToggle,
  onYearToggle,
  onClear,
}) => {
  const hasFilters =
    selectedGenres.length > 0 ||
    selectedTags.length > 0 ||
    selectedYears.length > 0;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div
      className={`mobile-filter-overlay fixed inset-0 z-[999] transition-opacity duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="mobile-filter-backdrop absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`mobile-filter-drawer absolute top-0 left-0 h-full w-full max-w-[280px] bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="drawer-header flex items-center justify-between p-4 border-b border-content/10 shrink-0">
          <h2 className="drawer-title text-base font-bold text-content">
            필터
          </h2>
          <div className="drawer-actions flex items-center gap-3">
            {hasFilters && (
              <button
                onClick={onClear}
                className="clear-btn text-xs text-primary hover:underline"
              >
                초기화
              </button>
            )}
            <button
              onClick={onClose}
              className="close-btn w-7 h-7 rounded-full bg-content/10 text-content flex items-center justify-center hover:bg-content/20 transition-colors text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Accordion list */}
        <div className="drawer-body flex-1 overflow-y-auto custom-scrollbar">
          <AccordionSection
            title="장르"
            items={availableGenres}
            selected={selectedGenres}
            onToggle={onGenreToggle}
            defaultOpen
          />
          <AccordionSection
            title="태그"
            items={availableTags}
            selected={selectedTags}
            onToggle={onTagToggle}
          />
          <AccordionSection
            title="방영 시기"
            items={availableYears}
            selected={selectedYears}
            onToggle={onYearToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;
