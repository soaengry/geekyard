package com.soaengry.geekyard.domain.anime.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.stream.Collectors;

@Slf4j
@Component
@ConditionalOnProperty(name = "recommendation.enabled", havingValue = "true", matchIfMissing = true)
public class RecommendationScheduler {

    @Value("${recommendation.python-path:python}")
    private String pythonPath;

    @Value("${recommendation.scripts-dir:}")
    private String scriptsDir;

    @Scheduled(cron = "0 0 3 * * *")
    public void runAnimeSimilarityBatch() {
        log.info("[Batch] 애니메이션 유사도 배치 시작");
        runScript("recommendation.py");
    }

    @Scheduled(cron = "0 5 3 * * *")
    public void runUserRecommendationBatch() {
        log.info("[Batch] 사용자 추천 배치 시작");
        runScript("user_recommendation.py");
    }

    private void runScript(String scriptName) {
        try {
            Path scriptPath = Path.of(scriptsDir, scriptName);

            ProcessBuilder pb = new ProcessBuilder(pythonPath, scriptPath.toString());
            pb.redirectErrorStream(true);
            pb.directory(Path.of(scriptsDir).toFile());

            Process process = pb.start();

            String output;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                output = reader.lines().collect(Collectors.joining("\n"));
            }

            int exitCode = process.waitFor();

            if (exitCode == 0) {
                log.info("[Batch] {} 완료 (exit=0)\n{}", scriptName, output);
            } else {
                log.error("[Batch] {} 실패 (exit={})\n{}", scriptName, exitCode, output);
            }
        } catch (Exception e) {
            log.error("[Batch] {} 실행 중 예외 발생", scriptName, e);
        }
    }
}
