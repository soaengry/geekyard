package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.dto.AnimeSortType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AnimeRepositoryCustom {

    Page<Long> searchAnimeIds(
            String q,
            String genresJson,
            String tagsJson,
            boolean hasYears,
            List<String> yearValues,
            AnimeSortType sort,
            Pageable pageable);
}
