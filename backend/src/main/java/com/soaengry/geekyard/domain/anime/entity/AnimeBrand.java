package com.soaengry.geekyard.domain.anime.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "anime_brands")
@Getter
public class AnimeBrand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;
}
