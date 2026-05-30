#!/bin/bash
set -euo pipefail

# ──────────────────────────────────────────────
# GeekYard Deploy Script (Health Check + Rollback)
# Usage: bash deploy.sh <staging|production> <docker-image>
# ──────────────────────────────────────────────

ENV="${1:?Usage: deploy.sh <staging|production> <docker-image>}"
NEW_IMAGE="${2:?Docker image required}"
COMPOSE_FILE="docker-compose.${ENV}.yml"
ENV_FILE=".env.${ENV}"
CONTAINER_NAME="geekyard-${ENV}"
HEALTH_URL="http://localhost:8080/actuator/health"
MAX_RETRIES=20
RETRY_INTERVAL=10

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── Save current image for rollback ──
PREVIOUS_IMAGE=""
if docker inspect "$CONTAINER_NAME" &>/dev/null; then
  PREVIOUS_IMAGE=$(docker inspect --format='{{.Config.Image}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
  log "Previous image: ${PREVIOUS_IMAGE:-none}"
fi

# ── Deploy new version ──
log "Deploying ${NEW_IMAGE} to ${ENV}..."
export DOCKER_IMAGE="$NEW_IMAGE"

# DB 컨테이너는 재생성하지 않음 (볼륨 데이터 보존 + 초기화는 최초 1회만)
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --no-recreate 2>/dev/null || \
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d 2>/dev/null || true

# DB 헬스 대기
for _svc in postgres redis mongodb; do
  _cname="geekyard-${_svc}"
  for _j in $(seq 1 30); do
    _st=$(docker inspect "$_cname" --format='{{.State.Health.Status}}' 2>/dev/null || echo "missing")
    [ "$_st" = "healthy" ] && { log "${_svc} healthy"; break; }
    [ "$_j" -eq 30 ] && log "⚠️ ${_svc} health timeout"
    sleep 3
  done
done

# 앱과 nginx만 강제 재생성
if ! docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate --no-deps app nginx; then
  log "⚠️ docker compose up (app/nginx) reported an issue"
fi

# ── Health check ──
log "Running health check (max ${MAX_RETRIES} attempts)..."
HEALTHY=false
for i in $(seq 1 "$MAX_RETRIES"); do
  CSTATE=$(docker inspect "$CONTAINER_NAME" --format='{{.State.Status}}(restarts={{.RestartCount}},exit={{.State.ExitCode}})' 2>/dev/null || echo "missing")
  HEALTH_RESPONSE=$(docker exec "$CONTAINER_NAME" wget -qO- "$HEALTH_URL" 2>/dev/null || echo "")
  STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | head -1 || echo "")
  log "Attempt $i: ${CSTATE} | ${HEALTH_RESPONSE:-(no response)}"
  if echo "$STATUS" | grep -q '"UP"'; then
    log "✅ Health check passed (attempt $i/${MAX_RETRIES})"
    HEALTHY=true
    break
  fi
  log "⏳ Waiting... ($i/${MAX_RETRIES})"
  sleep "$RETRY_INTERVAL"
done

# ── Rollback if unhealthy ──
if [ "$HEALTHY" = false ]; then
  log "❌ Health check failed after ${MAX_RETRIES} attempts"
  log "=== Last 80 lines of container logs ==="
  docker logs "$CONTAINER_NAME" --tail 80 2>&1 || true
  log "=== End of container logs ==="

  if [ -n "$PREVIOUS_IMAGE" ]; then
    log "🔄 Rolling back to ${PREVIOUS_IMAGE}..."
    export DOCKER_IMAGE="$PREVIOUS_IMAGE"
    if ! docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate --no-deps app nginx; then
      log "⚠️ rollback compose up reported an issue"
    fi

    # Verify rollback
    sleep 30
    ROLLBACK_STATUS=$(docker exec "$CONTAINER_NAME" wget -qO- "$HEALTH_URL" 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 || echo "")
    if echo "$ROLLBACK_STATUS" | grep -q '"UP"'; then
      log "✅ Rollback successful"
    else
      log "❌ Rollback also failed — manual intervention required"
    fi
  else
    log "⚠️ No previous image to rollback to"
  fi
  exit 1
fi

# ── Cleanup old images ──
log "Cleaning up unused images..."
docker image prune -f --filter "until=72h" 2>/dev/null || true

log "✅ Deployment complete: ${ENV} → ${NEW_IMAGE}"
