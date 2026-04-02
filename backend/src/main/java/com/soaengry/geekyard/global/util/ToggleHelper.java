package com.soaengry.geekyard.global.util;

import com.soaengry.geekyard.global.common.dto.LikeResponse;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * Like/Bookmark 토글 공통 로직.
 *
 * <p>패턴:
 * <pre>
 *   find → exists? → delete + decrement → LikeResponse(false)
 *                 → save   + increment → LikeResponse(true)
 * </pre>
 *
 * DataIntegrityViolationException(동시 요청 충돌)은 이미 좋아요된 상태로 간주한다.
 */
public final class ToggleHelper {

    private ToggleHelper() {}

    /**
     * 좋아요 토글 (카운트 변경 포함).
     *
     * @param finder    현재 좋아요 엔티티 조회
     * @param deleter   좋아요 엔티티 삭제
     * @param creator   좋아요 엔티티 생성 및 저장
     * @param decrement 카운트 감소 작업
     * @param increment 카운트 증가 작업
     * @param currentCount 현재 엔티티의 카운트 (캐시된 값 — clearAutomatically=true 기준)
     * @return 토글 후 상태
     */
    public static <T> LikeResponse toggleLike(
            Supplier<Optional<T>> finder,
            Consumer<T> deleter,
            Runnable creator,
            Runnable decrement,
            Runnable increment,
            int currentCount
    ) {
        Optional<T> existing = finder.get();
        if (existing.isPresent()) {
            deleter.accept(existing.get());
            decrement.run();
            return new LikeResponse(false, currentCount - 1);
        }

        try {
            creator.run();
        } catch (DataIntegrityViolationException e) {
            return new LikeResponse(true, currentCount);
        }
        increment.run();
        return new LikeResponse(true, currentCount + 1);
    }
}
