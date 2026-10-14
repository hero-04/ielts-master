#!/usr/bin/env bash
# Manual backup of the production database to ./backups/.
#   DATABASE_URL='postgresql://…' ./scripts/backup_db.sh
# Restore with:
#   pg_restore --clean --if-exists --no-owner --dbname "$DATABASE_URL" backups/<file>.dump
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to your Neon connection string}"
mkdir -p backups
STAMP=$(date -u +%Y-%m-%d_%H%M)
DIRECT_URL="${DATABASE_URL/-pooler/}"   # pg_dump needs Neon's direct (non-pooled) host
pg_dump "$DIRECT_URL" --no-owner --no-privileges --format=custom --file="backups/ielts_master_${STAMP}.dump"
echo "Saved backups/ielts_master_${STAMP}.dump"
