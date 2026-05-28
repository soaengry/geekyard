# Geekyard 배포 가이드

- **프론트엔드**: `geekyard.soaengry.com` (EC2 nginx 정적 파일 서빙)
- **백엔드 API**: `api.geekyard.soaengry.com` (EC2 Docker + Spring Boot)

---

## 1단계 — EC2 인스턴스 생성 (AWS 콘솔)

| 항목          | 값                         |
| ------------- | -------------------------- |
| AMI           | Ubuntu 24.04 LTS           |
| 인스턴스 타입 | t3.small (2 vCPU, 2GB RAM) |
| 스토리지      | 20GB 이상                  |

**보안 그룹 인바운드 규칙**

| 포트 | 프로토콜 | 소스      |
| ---- | -------- | --------- |
| 22   | TCP      | 내 IP     |
| 80   | TCP      | 0.0.0.0/0 |
| 443  | TCP      | 0.0.0.0/0 |

---

## 2단계 — 도메인 DNS 설정

`soaengry.com` DNS 관리 페이지에서 A 레코드 2개 추가:

```
A 레코드: geekyard.soaengry.com     → EC2 퍼블릭 IP
A 레코드: api.geekyard.soaengry.com → EC2 퍼블릭 IP
```

---

## 3단계 — 서버 초기 세팅

EC2에 SSH 접속 후 실행:

```bash
# Docker 설치
sudo apt update && sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# Certbot 설치
sudo apt install -y certbot
```

## 4단계 — SSL 인증서 발급

DNS 전파 확인 후 실행:

```bash
# DNS 전파 확인 (두 도메인 모두 확인)
nslookup geekyard.soaengry.com
nslookup api.geekyard.soaengry.com

# 두 도메인 동시 발급 (nginx 실행 전 standalone 모드)
sudo certbot certonly --standalone \
  -d geekyard.soaengry.com \
  -d api.geekyard.soaengry.com
```

발급된 인증서 위치: `/etc/letsencrypt/live/geekyard.soaengry.com/`

---

## 5단계 — 배포 디렉토리 및 파일 설정

```bash
# 배포 디렉토리 생성
sudo mkdir -p /opt/geekyard/frontend/dist
sudo chown -R $USER:$USER /opt/geekyard

# 로컬에서 infra 파일 전송
scp -r ./infra/* ubuntu@<EC2-IP>:/opt/geekyard/
```

`/opt/geekyard/.env.production` 파일 생성:

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>

# Redis
SPRING_DATA_REDIS_HOST=<host>
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=<password>

# MongoDB
SPRING_DATA_MONGODB_URI=mongodb://<host>:<port>/<db>

# JWT
JWT_SECRET=<secret>

# OAuth2
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
KAKAO_CLIENT_ID=<id>
KAKAO_CLIENT_SECRET=<secret>
NAVER_CLIENT_ID=<id>
NAVER_CLIENT_SECRET=<secret>

# CORS
FRONTEND_URL=https://geekyard.soaengry.com
```

---

## 6단계 — GitHub Secrets 등록

GitHub 저장소 → **Settings → Secrets and variables → Actions** 에서 추가:

| Secret 이름          | 값                                     |
| -------------------- | -------------------------------------- |
| `PRODUCTION_HOST`    | EC2 퍼블릭 IP                          |
| `PRODUCTION_USER`    | `ubuntu`                               |
| `PRODUCTION_SSH_KEY` | EC2 PEM 키 내용 (`cat ~/.ssh/key.pem`) |
| `PRODUCTION_DOMAIN`  | `geekyard.soaengry.com`                |

> `VITE_API_URL`은 GitHub Actions에서 빌드 시 `https://api.PRODUCTION_DOMAIN`으로 자동 주입됩니다.

---

## 7단계 — GHCR 로그인 (서버에서)

```bash
# GitHub Personal Access Token (read:packages 권한 필요)
echo "<GITHUB_TOKEN>" | docker login ghcr.io -u soaengry --password-stdin
```

---

## 8단계 — 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로:

**백엔드 (`build-backend` job)**

1. Docker 이미지 빌드 → GHCR push
2. SSH로 서버 접속 → `deploy.sh production <image>` 실행 (헬스체크 + 자동 롤백 포함)

**프론트엔드 (`build-frontend` job)**

1. `npm ci` + `npm run build` (VITE_API_URL 자동 주입)
2. `dist/` → 서버 `/opt/geekyard/frontend/dist/` 전송
3. nginx reload

**헬스체크 (`health-check` job)**

- 두 job 완료 후 `https://api.geekyard.soaengry.com/actuator/health` 확인

수동으로 먼저 테스트하려면:

```bash
cd /opt/geekyard
export DOCKER_IMAGE=ghcr.io/soaengry/geekyard-backend:latest
docker pull $DOCKER_IMAGE
bash deploy.sh production $DOCKER_IMAGE
```

---

## 9단계 — 배포 확인

```bash
# 컨테이너 상태 확인
docker ps

# 백엔드 헬스체크
curl https://api.geekyard.soaengry.com/actuator/health

# 프론트엔드 접속 확인
curl -I https://geekyard.soaengry.com

# 로그 확인
docker logs geekyard-production -f
```

---

## 트러블슈팅

### SSL 인증서 자동 갱신

```bash
# 갱신 테스트
sudo certbot renew --dry-run

# cron 등록 (자동 갱신 + nginx reload)
sudo crontab -e
# 추가: 0 3 * * * certbot renew --quiet && docker exec geekyard-nginx-production nginx -s reload
```

### 컨테이너 재시작

```bash
cd /opt/geekyard
docker compose -f docker-compose.production.yml restart
```

### 롤백

`deploy.sh`는 헬스체크 실패 시 자동으로 이전 이미지로 롤백합니다.
수동 롤백이 필요한 경우:

```bash
cd /opt/geekyard
export DOCKER_IMAGE=ghcr.io/soaengry/geekyard-backend:<이전-sha>
bash deploy.sh production $DOCKER_IMAGE
```

### t3.small 메모리 부족 시

Spring Boot 컨테이너 메모리 제한이 1024M으로 설정되어 있습니다.
OOM 발생 시 스왑 설정을 추가합니다:

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
