package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.dto.AnimeSortType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

public class AnimeRepositoryImpl implements AnimeRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    @Override
    public Page<Long> searchAnimeIds(
            String q,
            String genresJson,
            String tagsJson,
            boolean hasYears,
            List<String> yearValues,
            AnimeSortType sort,
            Pageable pageable) {

        String where = buildWhereClause(q, genresJson, tagsJson, hasYears);

        // Count query
        String countSql = "SELECT COUNT(*) FROM anime a JOIN anime_metadata m ON a.id = m.anime_id " + where;
        Query countQuery = em.createNativeQuery(countSql);
        setParameters(countQuery, q, genresJson, tagsJson, hasYears, yearValues);
        long total = ((Number) countQuery.getSingleResult()).longValue();

        if (total == 0) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // Data query with dynamic ORDER BY
        String dataSql = "SELECT a.id FROM anime a JOIN anime_metadata m ON a.id = m.anime_id "
                + where
                + " ORDER BY " + sort.getSql() + ", a.id DESC";
        Query dataQuery = em.createNativeQuery(dataSql);
        setParameters(dataQuery, q, genresJson, tagsJson, hasYears, yearValues);
        dataQuery.setFirstResult((int) pageable.getOffset());
        dataQuery.setMaxResults(pageable.getPageSize());

        @SuppressWarnings("unchecked")
        List<Long> ids = dataQuery.getResultList();

        return new PageImpl<>(ids, pageable, total);
    }

    private String buildWhereClause(String q, String genresJson, String tagsJson, boolean hasYears) {
        StringBuilder sb = new StringBuilder("WHERE 1=1");
        if (q != null) {
            sb.append(" AND REPLACE(a.name, ' ', '') ILIKE '%' || REPLACE(:q, ' ', '') || '%'");
        }
        if (genresJson != null) {
            sb.append(" AND m.genres @> CAST(:genresJson AS jsonb)");
        }
        if (tagsJson != null) {
            sb.append(" AND m.tags @> CAST(:tagsJson AS jsonb)");
        }
        if (hasYears) {
            sb.append(" AND a.air_year_quarter IN (:yearValues)");
        }
        return sb.toString();
    }

    private void setParameters(Query query, String q, String genresJson, String tagsJson,
                               boolean hasYears, List<String> yearValues) {
        if (q != null) query.setParameter("q", q);
        if (genresJson != null) query.setParameter("genresJson", genresJson);
        if (tagsJson != null) query.setParameter("tagsJson", tagsJson);
        if (hasYears) query.setParameter("yearValues", yearValues);
    }
}
