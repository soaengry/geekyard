package com.soaengry.geekyard.domain.anime.service;

import com.soaengry.geekyard.domain.anime.dto.response.AnimeDetailResponse;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeFilterResponse;
import com.soaengry.geekyard.domain.anime.dto.response.AnimeListItemResponse;
import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.AnimeFilter;
import com.soaengry.geekyard.domain.anime.exception.AnimeErrorCode;
import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.anime.repository.AnimeFilterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnimeService {

    private final MongoTemplate mongoTemplate;
    private final AnimeFilterRepository animeFilterRepository;

    public AnimeFilterResponse getAnimeFilter() {
        AnimeFilter filter = animeFilterRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new AnimeException(AnimeErrorCode.ANIME_NOT_FOUND));
        return AnimeFilterResponse.from(filter);
    }

    public Page<AnimeListItemResponse> searchAnime(
            String q, List<String> genres, List<String> tags, List<String> years, int page, int size) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (StringUtils.hasText(q)) {
            criteriaList.add(Criteria.where("name").regex(q, "i"));
        }
        if (genres != null && !genres.isEmpty()) {
            criteriaList.add(Criteria.where("genres").all(genres));
        }
        if (tags != null && !tags.isEmpty()) {
            criteriaList.add(Criteria.where("tags").all(tags));
        }
        if (years != null && !years.isEmpty()) {
            List<Criteria> yearCriteria = years.stream()
                    .map(year -> Criteria.where("air_year_quarter").regex(buildYearPattern(year)))
                    .toList();
            Criteria yearFilter = yearCriteria.size() == 1
                    ? yearCriteria.get(0)
                    : new Criteria().orOperator(yearCriteria.toArray(new Criteria[0]));
            criteriaList.add(yearFilter);
        }

        Query query = criteriaList.isEmpty()
                ? new Query()
                : new Query(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));

        long total = mongoTemplate.count(query, Anime.class);

        query.skip((long) page * size).limit(size);
        List<Anime> animes = mongoTemplate.find(query, Anime.class);

        List<AnimeListItemResponse> content = animes.stream()
                .map(AnimeListItemResponse::from)
                .toList();

        return new PageImpl<>(content, PageRequest.of(page, size), total);
    }

    public AnimeDetailResponse getAnimeDetail(String id) {
        Anime anime = mongoTemplate.findById(id, Anime.class);
        if (anime == null) {
            throw new AnimeException(AnimeErrorCode.ANIME_NOT_FOUND);
        }
        return AnimeDetailResponse.from(anime);
    }

    private String buildYearPattern(String year) {
        if ("2000년대 이전".equals(year)) {
            return "19[0-9]{2}년";
        }
        if (year.endsWith("년대")) {
            String decadeBase = year.replace("년대", "");
            return decadeBase.substring(0, decadeBase.length() - 1) + "[0-9]년";
        }
        return year;
    }
}
