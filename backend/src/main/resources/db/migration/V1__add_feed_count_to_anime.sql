-- 애니메 테이블에 feed_count 컬럼 추가
-- AnimeSortType.POPULAR 정렬 최적화를 위한 카운터 컬럼
ALTER TABLE anime ADD COLUMN IF NOT EXISTS feed_count INTEGER NOT NULL DEFAULT 0;

-- 기존 피드 데이터 기반으로 feed_count 초기값 동기화
UPDATE anime a
SET feed_count = (
    SELECT COUNT(*) FROM feeds f WHERE f.anime_id = a.id
);
