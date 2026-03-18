package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.UserGenrePreference;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserGenrePreferenceRepository extends JpaRepository<UserGenrePreference, Long> {

    List<UserGenrePreference> findByUser(User user);

    void deleteByUser(User user);

    boolean existsByUser(User user);
}
