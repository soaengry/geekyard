#!/bin/bash
set -euo pipefail

# ──────────────────────────────────────────────
# GeekYard Deploy Script (Health Check + Rollback)
# Usage: bash deploy.sh <staging|production> <docker-image>
# ──────────────────────────────────────────────

ENV="${1:?Usage: deploy.sh <staging|production> <docker-image>}"
NEW_IMAGE="${2:?Docker image required}"
COMPOSE_FILE="docker-compose.${ENV}.yml"
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
docker compose -f "$COMPOSE_FILE" up -d --force-recreate --no-build

# ── Health check ──
log "Running health check (max ${MAX_RETRIES} attempts)..."
HEALTHY=false
for i in $(seq 1 "$MAX_RETRIES"); do
  STATUS=$(docker exec "$CONTAINER_NAME" wget -qO- "$HEALTH_URL" 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 || echo "")
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

  if [ -n "$PREVIOUS_IMAGE" ]; then
    log "🔄 Rolling back to ${PREVIOUS_IMAGE}..."
    export DOCKER_IMAGE="$PREVIOUS_IMAGE"
    docker compose -f "$COMPOSE_FILE" up -d --force-recreate --no-build

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
