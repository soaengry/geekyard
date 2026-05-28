# GeekYard 배포 가이드

## 아키텍처

```
[Client (Browser)]           [EC2 서버]
React + Vite (정적 파일)      Nginx → Spring Boot (Docker)
    │                              │
    └── API 호출 ──────────────────┘
```

- **프론트엔드**: EC2의 Nginx가 빌드된 정적 파일(`/opt/geekyard/frontend/dist`) 서빙
- **백엔드 API**: EC2의 Docker 컨테이너 (Spring Boot)

### 환경 분리

| 환경 | 트리거 | Backend | Frontend |
|------|--------|---------|----------|
| Staging | `dev` 브랜치 push | EC2 (staging) | EC2 Nginx |
| Production | `main` 브랜치 push | EC2 (production) | EC2 Nginx |

---

## 1. EC2 서버 초기 설정

```bash
# Docker 설치
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER

# 프로젝트 디렉토리 생성
sudo mkdir -p /opt/geekyard/nginx /opt/geekyard/frontend/dist
sudo chown -R $USER:$USER /opt/geekyard

# infra 파일 복사
cp docker-compose.staging.yml /opt/geekyard/
cp docker-compose.production.yml /opt/geekyard/
cp deploy.sh /opt/geekyard/
cp -r nginx/ /opt/geekyard/

# 환경변수 파일 생성 (.env.example 참고)
cp .env.example /opt/geekyard/.env.staging
cp .env.example /opt/geekyard/.env.production
# → 각 환경에 맞게 값 수정

# GHCR 로그인
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

## 2. GitHub Secrets 설정

Repository → Settings → Secrets → Actions:

```
# Staging
STAGING_HOST        = <staging EC2 IP>
STAGING_USER        = ubuntu
STAGING_SSH_KEY     = <SSH 개인키>

# Production
PRODUCTION_HOST     = <production EC2 IP>
PRODUCTION_USER     = ubuntu
PRODUCTION_SSH_KEY  = <SSH 개인키>
PRODUCTION_DOMAIN   = geekyard.soaengry.com
```

Production 환경은 GitHub Environments에서 `production` 환경을 생성하고
필요시 수동 승인(Protection Rules)을 설정한다.

## 3. 배포 흐름

### Staging
```
feat/* → PR → dev 머지 → CI 테스트 → Docker 빌드 → EC2 배포 → 헬스체크
```

### Production
```
dev → PR → main 머지 → CI 테스트 → Docker 빌드 → EC2 배포 → 헬스체크
```

## 4. 헬스체크

- Docker HEALTHCHECK: 30초 간격, `/actuator/health`
- deploy.sh: 배포 후 최대 200초(20회 × 10초) 대기
- GitHub Actions: 배포 후 최대 300초(30회 × 10초) 재확인

## 5. 롤백

### 자동 롤백
deploy.sh가 헬스체크 실패 시 이전 이미지로 자동 롤백한다.

### 수동 롤백
```bash
# 특정 커밋의 이미지로 롤백
cd /opt/geekyard
export DOCKER_IMAGE=ghcr.io/soaengry/geekyard-backend:prod-<commit-sha>
docker compose -f docker-compose.production.yml up -d --force-recreate
```

## 6. 파일 구조

```
.github/workflows/
├── ci.yml                  # PR/push 시 테스트 + 린트
├── deploy-staging.yml      # dev → staging 자동 배포
└── deploy-production.yml   # main → production 자동 배포

backend/
├── Dockerfile              # Multi-stage 빌드
├── .dockerignore
└── src/main/resources/
    ├── application.yaml            # 공통 설정
    ├── application-staging.yaml    # staging 오버라이드
    └── application-production.yaml # production 오버라이드

infra/
├── docker-compose.staging.yml
├── docker-compose.production.yml
├── deploy.sh               # 헬스체크 + 롤백 스크립트
├── nginx/
│   ├── nginx.conf          # staging 리버스 프록시 (HTTP)
│   ├── nginx.prod.conf     # production 리버스 프록시 (HTTPS)
│   ├── docker-compose.staging.yml
│   ├── docker-compose.production.yml
│   ├── deploy.sh
│   └── DEPLOY-GUIDE.md
├── .env.example
└── DEPLOY-GUIDE.md         # (deprecated → docs/deployment.md 참고)
```

> 최신 배포 가이드는 [docs/deployment.md](../../docs/deployment.md)를 참고하세요.
