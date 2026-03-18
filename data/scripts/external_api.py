"""
외부 API 클라이언트 (AniList, MyAnimeList)
data/external_mapping.ipynb, data/new_anime_sync.ipynb 에서 공유
"""

import html
import re
import time

import requests


def clean_html_synopsis(html_text: str | None) -> str:
    """HTML 줄거리를 plain text로 변환.
    - <br>, <br/> → 줄바꿈
    - HTML 태그 제거
    - HTML entities 디코딩 (&#39; → ')
    - 연속 빈줄 정리
    """
    if not html_text:
        return ""
    text = re.sub(r"<br\s*/?>", "\n", html_text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ── AniList API (GraphQL) ────────────────────────────────

ANILIST_URL = "https://graphql.anilist.co"

# AniList format → DB medium 매핑
ANILIST_FORMAT_MAP = {
    "TV": "TV",
    "TV_SHORT": "TV",
    "MOVIE": "극장판",
    "OVA": "OVA",
    "ONA": "ONA",
    "SPECIAL": "스페셜",
    "MUSIC": "뮤직",
}

# AniList season → 한국어 분기
ANILIST_SEASON_MAP = {
    "WINTER": "1분기",
    "SPRING": "2분기",
    "SUMMER": "3분기",
    "FALL": "4분기",
}

# 장르 영문 → 한국어 매핑
GENRE_KO_MAP = {
    "Action": "액션",
    "Adventure": "모험",
    "Comedy": "코미디",
    "Drama": "드라마",
    "Fantasy": "판타지",
    "Horror": "공포",
    "Mystery": "미스터리",
    "Romance": "로맨스",
    "Sci-Fi": "SF",
    "Slice of Life": "일상",
    "Sports": "스포츠",
    "Supernatural": "초자연",
    "Thriller": "스릴러",
    "Suspense": "서스펜스",
    "Ecchi": "에치",
    "Hentai": "성인",
    "Boys Love": "BL",
    "Girls Love": "GL",
    "Gourmet": "미식",
    "Award Winning": "수상작",
    "Avant Garde": "아방가르드",
    "Mahou Shoujo": "마법소녀",
    "Mecha": "메카",
}


def _anilist_request(query: str, variables: dict) -> dict:
    """AniList GraphQL 요청. rate limit 초과 시 자동 재시도."""
    resp = requests.post(
        ANILIST_URL,
        json={"query": query, "variables": variables},
        timeout=15,
    )
    if resp.status_code == 429:
        retry_after = int(resp.headers.get("Retry-After", 60))
        time.sleep(retry_after)
        resp = requests.post(
            ANILIST_URL,
            json={"query": query, "variables": variables},
            timeout=15,
        )
    resp.raise_for_status()
    return resp.json().get("data", {})


def anilist_search(query: str, page: int = 1, per_page: int = 10) -> list[dict]:
    """AniList 애니메이션 검색. media 리스트 반환."""
    gql = """
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: ANIME) {
          id
          idMal
          title { romaji english native }
          synonyms
          format
          seasonYear
          season
          episodes
          meanScore
          studios(isMain: true) { nodes { name } }
          description(asHtml: false)
        }
      }
    }
    """
    data = _anilist_request(gql, {
        "search": query, "page": page, "perPage": per_page,
    })
    return data.get("Page", {}).get("media", [])


def anilist_get_anime(anilist_id: int) -> dict | None:
    """AniList 애니메이션 상세 조회."""
    gql = """
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title { romaji english native }
        synonyms
        format
        seasonYear
        season
        episodes
        meanScore
        studios(isMain: true) { nodes { name } }
        description(asHtml: false)
        coverImage { large medium }
        startDate { year month day }
        genres
      }
    }
    """
    data = _anilist_request(gql, {"id": anilist_id})
    return data.get("Media")


def anilist_get_season(
    year: int, season: str, per_page: int = 50,
) -> list[dict]:
    """AniList 시즌별 애니메이션 목록 조회 (자동 페이지네이션).
    season: WINTER, SPRING, SUMMER, FALL (uppercase)
    """
    gql = """
    query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage }
        media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title { romaji english native }
          synonyms
          format
          seasonYear
          season
          episodes
          meanScore
          studios(isMain: true) { nodes { name } }
          description(asHtml: false)
          coverImage { large medium }
          genres
        }
      }
    }
    """
    results = []
    has_next = True
    current_page = 1

    while has_next:
        data = _anilist_request(gql, {
            "season": season.upper(),
            "seasonYear": year,
            "page": current_page,
            "perPage": per_page,
        })
        page_data = data.get("Page", {})
        results.extend(page_data.get("media", []))
        has_next = page_data.get("pageInfo", {}).get("hasNextPage", False)
        current_page += 1
        time.sleep(0.7)

    return results


def anilist_format_air_yq(media: dict) -> str | None:
    """AniList media → '2026년 2분기' 형식으로 변환."""
    year = media.get("seasonYear")
    season = media.get("season", "")
    quarter = ANILIST_SEASON_MAP.get(season, "")
    if year and quarter:
        return f"{year}년 {quarter}"
    elif year:
        return f"{year}년"
    return None


def translate_genres(genres: list[str]) -> list[str]:
    """장르 목록을 한국어로 변환."""
    return [GENRE_KO_MAP.get(g, g) for g in genres]


def match_anilist_by_title_and_year(
    candidates: list[dict],
    target_title: str,
    target_year: int | None = None,
) -> dict | None:
    """AniList 검색 후보 중 제목+연도로 최적 매칭."""
    if not candidates:
        return None

    target_lower = target_title.lower().strip()

    # 1) native(일본어) 제목 정확 일치
    for c in candidates:
        native = (c.get("title", {}).get("native") or "").lower().strip()
        if native and native == target_lower:
            return c

    # 2) romaji 제목 정확 일치
    for c in candidates:
        romaji = (c.get("title", {}).get("romaji") or "").lower().strip()
        if romaji and romaji == target_lower:
            return c

    # 3) english 제목 정확 일치
    for c in candidates:
        en = (c.get("title", {}).get("english") or "").lower().strip()
        if en and en == target_lower:
            return c

    # 4) synonyms 포함 여부
    for c in candidates:
        for syn in (c.get("synonyms") or []):
            if syn.lower().strip() == target_lower:
                return c

    # 5) 연도 일치 + 첫 번째
    if target_year:
        for c in candidates:
            if c.get("seasonYear") == target_year:
                return c

    # 6) fallback
    return candidates[0] if candidates else None


# ── MyAnimeList API v2 ───────────────────────────────────

MAL_BASE = "https://api.myanimelist.net/v2"

# MAL media_type → 우리 DB medium 매핑
MAL_MEDIUM_MAP = {
    "tv": "TV",
    "movie": "극장판",
    "ova": "OVA",
    "ona": "ONA",
    "special": "스페셜",
    "tv_special": "TV 스페셜",
    "music": "뮤직",
    "pv": "PV",
    "cm": "CM",
}

# MAL season → 한국어 분기
MAL_SEASON_MAP = {
    "winter": "1분기",
    "spring": "2분기",
    "summer": "3분기",
    "fall": "4분기",
}


def _mal_headers(client_id: str) -> dict:
    return {"X-MAL-CLIENT-ID": client_id}


def mal_search_anime(query: str, client_id: str, limit: int = 10) -> list[dict]:
    """MAL 애니메이션 검색. data 노드 배열 반환."""
    resp = requests.get(
        f"{MAL_BASE}/anime",
        params={
            "q": query,
            "limit": limit,
            "fields": "id,title,alternative_titles,media_type,start_season,num_episodes,mean,studios",
        },
        headers=_mal_headers(client_id),
        timeout=10,
    )
    resp.raise_for_status()
    return [item["node"] for item in resp.json().get("data", [])]


def mal_get_anime(mal_id: int, client_id: str) -> dict:
    """MAL 애니메이션 상세 조회."""
    fields = (
        "id,title,alternative_titles,media_type,start_season,synopsis,"
        "genres,mean,num_episodes,main_picture,studios,status"
    )
    resp = requests.get(
        f"{MAL_BASE}/anime/{mal_id}",
        params={"fields": fields},
        headers=_mal_headers(client_id),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def mal_get_season(
    year: int, season: str, client_id: str, limit: int = 500,
) -> list[dict]:
    """MAL 시즌별 애니메이션 목록 조회."""
    fields = (
        "id,title,alternative_titles,media_type,start_season,synopsis,"
        "genres,mean,num_episodes,main_picture,studios,status"
    )
    results = []
    url = f"{MAL_BASE}/anime/season/{year}/{season}"
    params = {"fields": fields, "limit": min(limit, 100), "sort": "anime_num_list_users"}

    while url and len(results) < limit:
        resp = requests.get(
            url,
            params=params,
            headers=_mal_headers(client_id),
            timeout=10,
        )
        resp.raise_for_status()
        body = resp.json()
        results.extend(item["node"] for item in body.get("data", []))
        url = body.get("paging", {}).get("next")
        params = None
        time.sleep(0.5)

    return results[:limit]


def format_air_year_quarter(start_season: dict | None) -> str | None:
    """MAL start_season → '2026년 2분기' 형식으로 변환."""
    if not start_season:
        return None
    year = start_season.get("year")
    season = start_season.get("season", "")
    quarter = MAL_SEASON_MAP.get(season, "")
    if year and quarter:
        return f"{year}년 {quarter}"
    elif year:
        return f"{year}년"
    return None
