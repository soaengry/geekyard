"""
사용자 개인화 추천 시스템 (하이브리드 필터링) 배치 스크립트

- 협업 필터링 (CF): 유사 유저의 평가 기반 추천
  - 크롤링 유저(external_user_id)의 리뷰도 CF 행렬에 포함하여 유사도 계산 정확도 향상
- 콘텐츠 기반 필터링 (CBF): 유저 프로필 벡터 ↔ 애니 특징 벡터 유사도
- 콜드 스타트: 장르 선호도 기반 CBF 프로필 생성
- 하이브리드: α × CF + (1-α) × CBF (상호작용 수에 따라 α 조정)

유저 구분:
  - 사이트 유저: user_id 존재, external_user_id NULL → 추천 결과 저장 대상
  - 크롤링 유저: user_id NULL, external_user_id 존재 → CF 행렬에만 참여

결과를 user_recommendations 테이블에 사이트 유저별 Top-20으로 저장합니다.
"""

import logging
import os
import json
import sys

import dotenv
import numpy as np
import psycopg2
from psycopg2.extras import execute_batch
from scipy.sparse import csr_matrix
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(
    level=logging.INFO,
    format="[Batch][user_recommendation] %(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


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
        log.info("DB 연결 완료")

        # ── 데이터 수집 ──
        # 리뷰: user_id(사이트) 또는 external_user_id(크롤링) 중 하나가 존재
        cur.execute("""
            SELECT user_id, external_user_id, anime_id, score
            FROM anime_reviews
            WHERE deleted_at IS NULL
        """)
        reviews_raw = cur.fetchall()
        log.info("리뷰 수: %d", len(reviews_raw))

        # 시청 기록, 장르 선호도: 사이트 유저만 존재
        cur.execute("SELECT user_id, anime_id FROM anime_watches")
        watches = cur.fetchall()
        log.info("시청 기록 수: %d", len(watches))

        cur.execute("""
            SELECT a.id, m.genres, m.tags, m.directors, m.production_companies
            FROM anime a
            LEFT JOIN anime_metadata m ON a.id = m.anime_id
            ORDER BY a.id
        """)
        metadata_rows = cur.fetchall()
        log.info("애니메이션 수: %d", len(metadata_rows))

        cur.execute("SELECT user_id, genre FROM user_genre_preferences")
        genre_prefs = cur.fetchall()
        log.info("장르 선호도 레코드 수: %d", len(genre_prefs))

        # series_mapping: anime_id → group_name (동일 시리즈 중복 제거용)
        cur.execute("SELECT anime_id, group_name FROM series_mapping")
        series_rows = cur.fetchall()
        anime_group_map = {aid: gname for aid, gname in series_rows}
        log.info("시리즈 매핑 수: %d", len(anime_group_map))

        # ── 애니메이션 메타데이터 파싱 ──
        anime_ids = []
        genres_list = []
        tags_list = []
        directors_list = []
        companies_list = []

        for row in metadata_rows:
            aid, genres_json, tags_json, directors_json, companies_json = row
            anime_ids.append(aid)

            genres = genres_json if isinstance(genres_json, list) else (json.loads(genres_json) if genres_json else [])
            genres_list.append(genres)

            tags = tags_json if isinstance(tags_json, list) else (json.loads(tags_json) if tags_json else [])
            tags_list.append(tags)

            directors_raw = directors_json if isinstance(directors_json, list) else (json.loads(directors_json) if directors_json else [])
            directors_list.append([d["name"] for d in directors_raw if isinstance(d, dict) and "name" in d])

            companies_raw = companies_json if isinstance(companies_json, list) else (json.loads(companies_json) if companies_json else [])
            companies_list.append([c["name"] for c in companies_raw if isinstance(c, dict) and "name" in c])

        anime_id_to_idx = {aid: i for i, aid in enumerate(anime_ids)}
        log.info("Parsed %d anime", len(anime_ids))

        # ── 통합 유저 키 구성 ──
        # 사이트 유저: ("site", user_id) / 크롤링 유저: ("ext", external_user_id)
        # CF 행렬에는 모두 포함, 추천 결과는 사이트 유저에게만 생성
        all_user_keys = set()
        site_user_keys = set()  # 추천 대상

        # 리뷰 → (unified_key, anime_id, score) 로 변환
        reviews = []
        for user_id, ext_user_id, anime_id, score in reviews_raw:
            if user_id is not None:
                key = ("site", user_id)
                site_user_keys.add(key)
            elif ext_user_id is not None:
                key = ("ext", ext_user_id)
            else:
                continue
            all_user_keys.add(key)
            reviews.append((key, anime_id, score))

        for uid, _ in watches:
            key = ("site", uid)
            all_user_keys.add(key)
            site_user_keys.add(key)

        for uid, _ in genre_prefs:
            key = ("site", uid)
            all_user_keys.add(key)
            site_user_keys.add(key)

        # 정렬: 사이트 유저 먼저, 크롤링 유저 나중에
        user_keys = sorted(all_user_keys, key=lambda k: (0 if k[0] == "site" else 1, k[1]))
        user_key_to_idx = {k: i for i, k in enumerate(user_keys)}

        n_site_users = len(site_user_keys)
        n_all_users = len(user_keys)
        log.info("사이트 유저 수: %d, 크롤링 유저 수: %d, 전체: %d",
                 n_site_users, n_all_users - n_site_users, n_all_users)

        # 사이트 유저 인덱스 → 실제 user_id 매핑
        site_idx_to_user_id = {}
        for key in site_user_keys:
            site_idx_to_user_id[user_key_to_idx[key]] = key[1]

        user_genre_map = {}
        for uid, genre in genre_prefs:
            key = ("site", uid)
            user_genre_map.setdefault(key, []).append(genre)

        # ── User-Anime 상호작용 행렬 (전체 유저) ──
        n_anime = len(anime_ids)

        interaction = {}
        for key, aid, score in reviews:
            if key in user_key_to_idx and aid in anime_id_to_idx:
                interaction[(user_key_to_idx[key], anime_id_to_idx[aid])] = float(score)

        IMPLICIT_SCORE = 6.0
        for uid, aid in watches:
            key = ("site", uid)
            if key in user_key_to_idx and aid in anime_id_to_idx:
                pair = (user_key_to_idx[key], anime_id_to_idx[aid])
                if pair not in interaction:
                    interaction[pair] = IMPLICIT_SCORE

        rows_idx, cols_idx, vals = [], [], []
        for (r, c), v in interaction.items():
            rows_idx.append(r)
            cols_idx.append(c)
            vals.append(v)

        user_anime_matrix = csr_matrix((vals, (rows_idx, cols_idx)), shape=(n_all_users, n_anime))
        log.info("상호작용 행렬: %s, nnz=%d", user_anime_matrix.shape, user_anime_matrix.nnz)

        user_interaction_counts = np.diff(user_anime_matrix.indptr)
        log.info("평균 상호작용 수: %.1f", user_interaction_counts.mean())
        log.info("상호작용 0인 유저: %d", (user_interaction_counts == 0).sum())

        # ── 협업 필터링 (CF) ──
        # 전체 유저 N×N 유사도는 메모리 초과 → 사이트 유저 행만 계산
        # cosine_similarity(site_matrix, all_matrix) → (n_site, n_all)
        TOP_K_USERS = 20
        site_indices = sorted(site_idx_to_user_id.keys())

        site_matrix = user_anime_matrix[site_indices]
        site_sim = cosine_similarity(site_matrix, user_anime_matrix)
        log.info("유사도 행렬: %s (%.1f MB)", site_sim.shape, site_sim.nbytes / 1024**2)

        for local_i, global_i in enumerate(site_indices):
            site_sim[local_i, global_i] = 0

        watched_dense = user_anime_matrix.toarray()
        watched_mask_site = {i: watched_dense[i] > 0 for i in site_indices}

        cf_scores = np.zeros((len(site_indices), n_anime))
        for local_i in range(len(site_indices)):
            sim_row = site_sim[local_i]
            top_k_idx = np.argsort(sim_row)[-TOP_K_USERS:]
            top_k_sims = sim_row[top_k_idx]

            if top_k_sims.sum() == 0:
                continue

            for j, s in zip(top_k_idx, top_k_sims):
                if s <= 0:
                    continue
                neighbor_row = user_anime_matrix[j].toarray().flatten()
                cf_scores[local_i] += s * neighbor_row

            sim_sum = top_k_sims[top_k_sims > 0].sum()
            if sim_sum > 0:
                cf_scores[local_i] /= sim_sum

        for local_i, global_i in enumerate(site_indices):
            cf_scores[local_i][watched_mask_site[global_i]] = 0
            row_max = cf_scores[local_i].max()
            if row_max > 0:
                cf_scores[local_i] /= row_max

        del site_sim
        log.info("CF 점수 계산 완료 (사이트 유저 %d명)", len(site_indices))

        # ── 콘텐츠 기반 필터링 (CBF) ──
        mlb_genres = MultiLabelBinarizer()
        mlb_tags = MultiLabelBinarizer()
        mlb_directors = MultiLabelBinarizer()
        mlb_companies = MultiLabelBinarizer()

        vec_genres = mlb_genres.fit_transform(genres_list)
        vec_tags = mlb_tags.fit_transform(tags_list)
        vec_directors = mlb_directors.fit_transform(directors_list)
        vec_companies = mlb_companies.fit_transform(companies_list)

        feature_matrix = np.hstack([vec_genres, vec_tags, vec_directors, vec_companies]).astype(np.float32)
        log.info("Feature matrix: %s", feature_matrix.shape)

        POSITIVE_THRESHOLD = 6.0
        n_features = feature_matrix.shape[1]

        # 사이트 유저별 CBF 프로필 + 점수 계산
        cbf_scores = np.zeros((len(site_indices), n_anime))

        for local_i, global_i in enumerate(site_indices):
            scores = watched_dense[global_i]
            positive_mask = scores >= POSITIVE_THRESHOLD
            positive_indices = np.where(positive_mask)[0]

            profile = np.zeros(n_features, dtype=np.float32)
            if len(positive_indices) > 0:
                weights = scores[positive_indices]
                weighted_features = feature_matrix[positive_indices] * weights[:, np.newaxis]
                profile = weighted_features.sum(axis=0) / weights.sum()
            elif user_keys[global_i] in user_genre_map:
                preferred_genres = user_genre_map[user_keys[global_i]]
                genre_classes = list(mlb_genres.classes_)
                for g in preferred_genres:
                    if g in genre_classes:
                        idx = genre_classes.index(g)
                        profile[idx] = 1.0

            if profile.sum() > 0:
                sim = cosine_similarity(profile.reshape(1, -1), feature_matrix).flatten()
                sim[watched_mask_site[global_i]] = 0
                row_max = sim.max()
                if row_max > 0:
                    sim /= row_max
                cbf_scores[local_i] = sim

        has_profile = sum(1 for local_i in range(len(site_indices)) if cbf_scores[local_i].max() > 0)
        log.info("CBF 프로필 있는 사이트 유저: %d/%d", has_profile, n_site_users)

        # ── 하이브리드 결합 + 결과 저장 ──
        # 동일 시리즈 중복 제거: series_mapping 그룹당 대표작 1개만 (최고 점수 우선)
        TOP_N = 20
        # 충분한 후보를 확보하기 위해 여유 있게 정렬 (중복 제거로 줄어들 수 있음)
        CANDIDATE_POOL = TOP_N * 3
        result_rows = []

        for local_i, global_i in enumerate(site_indices):
            real_user_id = site_idx_to_user_id[global_i]
            count = user_interaction_counts[global_i]

            if count < 3:
                alpha = 0.0
            elif count < 10:
                alpha = 0.3
            else:
                alpha = 0.6

            final = alpha * cf_scores[local_i] + (1 - alpha) * cbf_scores[local_i]

            top_candidates = np.argsort(final)[-CANDIDATE_POOL:][::-1]

            if alpha == 0:
                reason = "GENRE" if count == 0 and user_keys[global_i] in user_genre_map else "CBF"
            elif alpha == 1.0:
                reason = "CF"
            else:
                reason = "HYBRID"

            seen_groups = set()
            picked = 0
            for idx in top_candidates:
                score = final[idx]
                if score <= 0:
                    break

                aid = anime_ids[idx]
                group = anime_group_map.get(aid)
                if group is not None:
                    if group in seen_groups:
                        continue
                    seen_groups.add(group)

                result_rows.append((real_user_id, aid, round(float(score), 4), reason))
                picked += 1
                if picked >= TOP_N:
                    break

        log.info("총 추천 레코드 수: %d", len(result_rows))
        log.info("추천 대상 유저 수: %d", len(set(r[0] for r in result_rows)))

        # ── 테이블 저장 ──
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_recommendations (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id),
                anime_id BIGINT NOT NULL REFERENCES anime(id),
                score NUMERIC(5, 4) NOT NULL,
                reason VARCHAR(10) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, anime_id)
            );
        """)
        pg.commit()

        cur.execute("TRUNCATE TABLE user_recommendations RESTART IDENTITY;")

        execute_batch(cur, """
            INSERT INTO user_recommendations (user_id, anime_id, score, reason)
            VALUES (%s, %s, %s, %s);
        """, result_rows, page_size=1000)
        pg.commit()
        log.info("Inserted %d rows into user_recommendations", len(result_rows))

        # ── 검증 ──
        cur.execute("SELECT COUNT(*) FROM user_recommendations")
        total = cur.fetchone()[0]
        log.info("총 추천 레코드: %d", total)

        cur.execute("SELECT COUNT(DISTINCT user_id) FROM user_recommendations")
        user_count = cur.fetchone()[0]
        log.info("추천 대상 유저 수: %d", user_count)

        cur.execute("SELECT reason, COUNT(*) FROM user_recommendations GROUP BY reason ORDER BY COUNT(*) DESC")
        for reason, cnt in cur.fetchall():
            log.info("  %s: %d", reason, cnt)

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
