package com.soaengry.geekyard.domain.anime.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "anime_years")
@Getter
public class AnimeYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;
}
