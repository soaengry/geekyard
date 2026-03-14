package com.soaengry.geekyard.global.service;

import com.soaengry.geekyard.domain.user.exception.UserErrorCode;
import com.soaengry.geekyard.domain.user.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L; // 10MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region:ap-northeast-2}")
    private String region;

    public String upload(MultipartFile file, Long userId) throws IOException {
        return upload(file, userId, "profiles");
    }

    public String upload(MultipartFile file, Long userId, String directory) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new UserException(UserErrorCode.FILE_TOO_LARGE);
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new UserException(UserErrorCode.INVALID_FILE_TYPE);
        }

        String ext = extractExtension(file.getOriginalFilename());
        String key = directory + "/" + userId + "/" + UUID.randomUUID() + "." + ext;

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );

        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    public void delete(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains(".amazonaws.com/")) return;
        try {
            String key = imageUrl.substring(imageUrl.indexOf(".amazonaws.com/") + ".amazonaws.com/".length());
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (Exception e) {
            log.warn("S3 파일 삭제 실패: {}", imageUrl, e);
        }
    }

    private String extractExtension(String filename) {
        if (filename == null) return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}
