import { FC, useEffect, useRef, useState } from "react";

interface AnimeFilterBarProps {
  availableGenres: string[];
  query: string;
  selectedGenres: string[];
  onQueryChange: (q: string) => void;
  onGenreToggle: (genre: string) => void;
}

const AnimeFilterBar: FC<AnimeFilterBarProps> = ({
  availableGenres: _availableGenres,
  query,
  selectedGenres: _selectedGenres,
  onQueryChange,
  onGenreToggle: _onGenreToggle,
}) => {
  const [inputValue, setInputValue] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onQueryChange(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="anime-filter-bar space-y-3">
      <div className="search-input-wrapper relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="애니메이션 검색..."
          className="search-input w-full pl-10 pr-4 py-2.5 rounded-xl border border-content/20 bg-surface text-content placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        />
        <span className="search-icon absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-base">
          🔍
        </span>
      </div>
    </div>
  );
};

export default AnimeFilterBar;
