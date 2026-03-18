"""
애니메이션 CBF 추천 시스템 (배치 스크립트)

genres, tags, directors, production_companies를 벡터화하여
Cosine Similarity 기반 Top-10 유사 애니메이션을 계산하고
anime_similar 테이블에 저장합니다.

동일 시리즈 중복 제거:
  1. series_id 기반 그룹핑
  2. 제목 패턴 + 제작사 기반 그룹핑 (series_id가 null인 경우)
  3. 결과를 series_mapping 테이블에 저장
"""

import logging
import os
import re
import json
import sys

import dotenv
import numpy as np
import psycopg2
from psycopg2.extras import execute_batch
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime
from collections import Counter

logging.basicConfig(
    level=logging.INFO,
    format="[Batch][recommendation] %(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


def normalize_title(name):
    """제목을 정규화하여 동일 시리즈/버전을 그룹핑할 수 있는 base title 추출"""
    s = name.strip()
    s = re.sub(r'\s*[\(（](자막|더빙|무삭제|무삭제판|자막판|더빙판|한국어 더빙)[\)）]', '', s)
    s = re.sub(r'\s*(시즌\s*\d+|Season\s*\d+|\d+(st|nd|rd|th)\s*Season)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s*(제?\d+기|파트\s*\d+|Part\s*\.?\s*\d+|\d+쿨)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s+(II|III|IV|V|VI|VII|VIII|IX|X)$', '', s)
    s = re.sub(r'\s+\d{1,2}$', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def main():
    dotenv.load_dotenv(dotenv.find_dotenv())

    pg = None
    try:
        pg = psycopg2.connect(
            host=os.environ["POSTGRES_HOST"],
            port=os.environ["POSTGRES_PORT"],
            dbname=os.environ["POSTGRES_DB"],
            user=os.environ["POSTGRES_USER"],
            password=os.environ["POSTGRES_PASSWORD"],
        )
        cur = pg.cursor()

        # ── 데이터 조회 ──
        cur.execute("""
            SELECT a.id, a.name, a.series_id, a.production, a.view_count, a.review_count,
                   m.genres, m.tags, m.directors, m.production_companies
            FROM anime a
            LEFT JOIN anime_metadata m ON a.id = m.anime_id
            ORDER BY a.id
        """)
        rows = cur.fetchall()
        log.info("Total anime: %d", len(rows))

        # ── 데이터 파싱 ──
        anime_ids = []
        names = []
        series_ids = []
        productions = []
        popularities = []
        genres_list = []
        tags_list = []
        directors_list = []
        companies_list = []

        for row in rows:
            aid, name, sid, production, view_count, review_count, genres_json, tags_json, directors_json, companies_json = row
            anime_ids.append(aid)
            names.append(name or "")
            series_ids.append(sid)
            productions.append(production or "")
            popularities.append((view_count or 0) + (review_count or 0))

            genres = genres_json if isinstance(genres_json, list) else (json.loads(genres_json) if genres_json else [])
            genres_list.append(genres)

            tags = tags_json if isinstance(tags_json, list) else (json.loads(tags_json) if tags_json else [])
            tags_list.append(tags)

            directors_raw = directors_json if isinstance(directors_json, list) else (json.loads(directors_json) if directors_json else [])
            directors_list.append([d["name"] for d in directors_raw if isinstance(d, dict) and "name" in d])

            companies_raw = companies_json if isinstance(companies_json, list) else (json.loads(companies_json) if companies_json else [])
            companies_list.append([c["name"] for c in companies_raw if isinstance(c, dict) and "name" in c])

        log.info("Parsed %d anime", len(anime_ids))

        # ── 시리즈 그룹핑 ──
        group_ids = [None] * len(anime_ids)
        next_group_id = 1

        # Phase 1: series_id 기반
        series_to_group = {}
        for i, sid in enumerate(series_ids):
            if sid is not None:
                if sid not in series_to_group:
                    series_to_group[sid] = next_group_id
                    next_group_id += 1
                group_ids[i] = series_to_group[sid]

        # Phase 2: 제목 패턴 + 제작사 기반
        title_prod_to_group = {}
        for i in range(len(anime_ids)):
            if group_ids[i] is not None:
                continue

            base_title = normalize_title(names[i])
            key = (base_title.lower(), productions[i].lower())

            if key not in title_prod_to_group:
                matched_group = None
                for j in range(len(anime_ids)):
                    if group_ids[j] is not None and normalize_title(names[j]).lower() == base_title.lower() and productions[j].lower() == productions[i].lower():
                        matched_group = group_ids[j]
                        break

                if matched_group is not None:
                    title_prod_to_group[key] = matched_group
                else:
                    title_prod_to_group[key] = next_group_id
                    next_group_id += 1

            group_ids[i] = title_prod_to_group[key]

        group_counts = Counter(group_ids)
        groups_with_multiple = sum(1 for c in group_counts.values() if c > 1)
        log.info("Total groups: %d, groups with 2+ members: %d", next_group_id - 1, groups_with_multiple)

        # ── series_mapping 테이블 저장 ──
        cur.execute("""
            CREATE TABLE IF NOT EXISTS series_mapping (
                id BIGSERIAL PRIMARY KEY,
                group_name VARCHAR(255) NOT NULL,
                anime_id BIGINT NOT NULL REFERENCES anime(id),
                UNIQUE(anime_id)
            );
        """)
        cur.execute("DELETE FROM series_mapping;")
        pg.commit()

        group_to_name = {}
        for i, gid in enumerate(group_ids):
            if gid not in group_to_name:
                group_to_name[gid] = normalize_title(names[i])

        mapping_rows = [(group_to_name[gid], anime_ids[i]) for i, gid in enumerate(group_ids) if gid is not None]
        execute_batch(cur, """
            INSERT INTO series_mapping (group_name, anime_id)
            VALUES (%s, %s)
            ON CONFLICT (anime_id) DO UPDATE SET group_name = EXCLUDED.group_name;
        """, mapping_rows, page_size=1000)
        pg.commit()
        log.info("series_mapping: %d rows inserted", len(mapping_rows))

        # ── 특징 벡터 생성 ──
        mlb_genres = MultiLabelBinarizer()
        mlb_tags = MultiLabelBinarizer()
        mlb_directors = MultiLabelBinarizer()
        mlb_companies = MultiLabelBinarizer()

        vec_genres = mlb_genres.fit_transform(genres_list)
        vec_tags = mlb_tags.fit_transform(tags_list)
        vec_directors = mlb_directors.fit_transform(directors_list)
        vec_companies = mlb_companies.fit_transform(companies_list)

        feature_matrix = np.hstack([vec_genres, vec_tags, vec_directors, vec_companies])
        log.info("Feature matrix shape: %s", feature_matrix.shape)

        # ── Cosine Similarity 계산 ──
        sim_matrix = cosine_similarity(feature_matrix)

        # ── Top-10 유사 애니 추출 ──
        TOP_K = 10
        similar_rows = []
        now = datetime.now()

        for i, aid in enumerate(anime_ids):
            my_group = group_ids[i]
            scores = sim_matrix[i]

            scored = []
            for j, score in enumerate(scores):
                if i == j:
                    continue
                if my_group is not None and group_ids[j] is not None and my_group == group_ids[j]:
                    continue
                if score > 0:
                    scored.append((j, float(score)))

            scored.sort(key=lambda x: (x[1], popularities[x[0]]), reverse=True)

            seen_groups = set()
            candidates = []
            for j, score in scored:
                candidate_group = group_ids[j]
                if candidate_group is not None:
                    if candidate_group in seen_groups:
                        continue
                    seen_groups.add(candidate_group)
                candidates.append((j, score))
                if len(candidates) >= TOP_K:
                    break

            for j, score in candidates:
                similar_rows.append((aid, anime_ids[j], round(score, 4), now))

        log.info("Total similar pairs: %d", len(similar_rows))

        # ── anime_similar 테이블 저장 ──
        cur.execute("""
            CREATE TABLE IF NOT EXISTS anime_similar (
                id BIGSERIAL PRIMARY KEY,
                anime_id BIGINT NOT NULL REFERENCES anime(id),
                similar_anime_id BIGINT NOT NULL REFERENCES anime(id),
                similarity NUMERIC(5, 4) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                UNIQUE(anime_id, similar_anime_id)
            );
        """)
        cur.execute("TRUNCATE TABLE anime_similar RESTART IDENTITY;")

        execute_batch(cur, """
            INSERT INTO anime_similar (anime_id, similar_anime_id, similarity, created_at)
            VALUES (%s, %s, %s, %s);
        """, similar_rows, page_size=1000)
        pg.commit()
        log.info("Inserted %d rows into anime_similar", len(similar_rows))

        # ── 결과 확인 ──
        cur.execute("SELECT COUNT(*) FROM anime_similar")
        count = cur.fetchone()[0]
        log.info("Total rows in anime_similar: %d", count)

        cur.close()
        log.info("Done!")
        return 0

    except Exception:
        log.exception("Batch failed")
        return 1
    finally:
        if pg is not None:
            pg.close()


if __name__ == "__main__":
    sys.exit(main())
