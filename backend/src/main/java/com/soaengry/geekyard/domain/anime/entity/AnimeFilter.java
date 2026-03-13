package com.soaengry.geekyard.domain.anime.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@NoArgsConstructor
@Document(collection = "ani_filter")
public class AnimeFilter {

    @Id
    private String id;

    private List<String> genres;

    private List<String> tags;

    private List<String> years;

    private List<String> brands;

    private List<String> productions;
}
