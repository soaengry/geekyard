package com.soaengry.geekyard.global.exception;

import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.user.exception.UserException;
import com.soaengry.geekyard.global.common.ApiResponse;
import com.soaengry.geekyard.global.common.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AnimeException.class)
    public ResponseEntity<ApiResponse<?>> handleAnimeException(AnimeException e) {
        log.warn("Anime Exception: {} - {}", e.getErrorCode().name(), e.getMessage());
        HttpStatus status = determineHttpStatusFromCode(e.getErrorCode().name());
        ErrorCode errorCode = ErrorCode.from(e.getErrorCode().name(), e.getMessage(), status);
        return ResponseEntity.status(status).body(ApiResponse.error(errorCode));
    }

    @ExceptionHandler(UserException.class)
    public ResponseEntity<ApiResponse<?>> handleUserException(UserException e) {
        log.warn("User Exception: {} - {}", e.getErrorCode().name(), e.getMessage());
        HttpStatus status = determineHttpStatusFromCode(e.getErrorCode().name());
        ErrorCode errorCode = ErrorCode.from(e.getErrorCode().name(), e.getMessage(), status);
        return ResponseEntity.status(status).body(ApiResponse.error(errorCode));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("Validation Exception: {}", message);
        ErrorCode errorCode = ErrorCode.from("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
        return ResponseEntity.badRequest().body(ApiResponse.error(errorCode));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        log.error("Unhandled Exception", e);
        ErrorCode errorCode = ErrorCode.from("INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        return ResponseEntity.internalServerError().body(ApiResponse.error(errorCode));
    }

    public HttpStatus determineHttpStatusFromCode(String codeName) {
        if (codeName.startsWith("AUTH")) {
            return HttpStatus.UNAUTHORIZED;
        }
        if (codeName.equals("INVALID_PASSWORD") || codeName.endsWith("UNAUTHORIZED")) {
            return HttpStatus.FORBIDDEN;
        }
        if (codeName.startsWith("DUPLICATE")) {
            return HttpStatus.CONFLICT;
        }
        if (codeName.endsWith("NOT_FOUND")) {
            return HttpStatus.NOT_FOUND;
        }
        return HttpStatus.BAD_REQUEST;
    }
}
