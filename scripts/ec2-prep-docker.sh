#!/usr/bin/env bash
# Run ONCE on the EC2 (as deployer or ubuntu with docker) BEFORE the first
# Docker deploy of pfolio. Safe around Memories: does not touch memories-app.
#
#   ssh … 'bash -s' < scripts/ec2-prep-docker.sh
#   # or copy up and:  bash ec2-prep-docker.sh
#
set -euo pipefail

echo "==> Disk before"
df -h / | sed -n '1,2p'
echo
echo "==> Biggest top-level dirs"
sudo du -xh / --max-depth=1 2>/dev/null | sort -h | tail -n 20 || true
echo
echo "==> Likely portfolio bloat (old SCP deploy)"
sudo du -sh /var/www/medzy.brozy.org 2>/dev/null || true
sudo du -sh /var/www/medzy.brozy.org/node_modules 2>/dev/null || true
sudo du -sh /var/www/medzy.brozy.org/app/node_modules 2>/dev/null || true

echo
echo "==> Docker disk use"
docker system df 2>/dev/null || true

echo
read -r -p "Clean old medzy source tree (keep nginx site dirs) + docker prune? [y/N] " ans
case "$ans" in
  y|Y|yes|YES) ;;
  *) echo "Aborted."; exit 0 ;;
esac

SITE=/var/www/medzy.brozy.org

# Preserve nothing from the old SCP tree except we recreate app/ for compose.
# Memories lives under /var/www/memories.brozy.org — untouched.
if [ -d "$SITE" ]; then
  echo "==> Archiving then clearing old medzy tree (node_modules, build, source)…"
  TS=$(date +%Y%m%d-%H%M%S)
  # Drop the worst offenders first (usually most of the 40GB).
  sudo rm -rf \
    "$SITE/node_modules" \
    "$SITE/app/node_modules" \
    "$SITE/build" \
    "$SITE/app/build" \
    "$SITE/.npm" \
    "$SITE/.cache" \
    2>/dev/null || true

  # Move leftover source aside (delete archive later once Docker is healthy).
  if [ -d "$SITE" ]; then
    sudo mkdir -p /var/tmp/medzy-old-"$TS"
    # Keep only what we need going forward: empty app/ for compose+.env
    sudo find "$SITE" -mindepth 1 -maxdepth 1 \
      ! -name 'app' \
      -exec sudo mv {} /var/tmp/medzy-old-"$TS"/ \; 2>/dev/null || true
    # Inside app/, strip everything except we want a clean slate for compose
    if [ -d "$SITE/app" ]; then
      sudo find "$SITE/app" -mindepth 1 -maxdepth 1 \
        ! -name '.env' \
        ! -name '.env.notification' \
        -exec sudo rm -rf {} \; 2>/dev/null || true
    else
      sudo mkdir -p "$SITE/app"
    fi
  fi
  echo "   Old files moved under /var/tmp/medzy-old-$TS (delete after Docker works)"
fi

echo "==> Stop leftover PM2 portfolio processes (Memories name left alone)"
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete medzy 2>/dev/null || true
  pm2 delete portfolio 2>/dev/null || true
  pm2 delete pfolio 2>/dev/null || true
fi

echo "==> Docker prune (dangling images/containers/networks; keeps memories-app)"
docker container prune -f >/dev/null 2>&1 || true
docker image prune -af >/dev/null 2>&1 || true
docker builder prune -af >/dev/null 2>&1 || true
# Do NOT docker volume prune blindly — Memories may use named volumes later.

echo "==> Apt / journal trim"
sudo apt-get clean >/dev/null 2>&1 || true
sudo journalctl --vacuum-size=100M >/dev/null 2>&1 || true

echo
echo "==> Disk after"
df -h / | sed -n '1,2p'
docker system df 2>/dev/null || true
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || true

echo
echo "Next:"
echo "  1) Ensure nginx for medzy.brozy.org proxies to http://127.0.0.1:3001"
echo "     (Memories stays on http://127.0.0.1:3000)"
echo "  2) Push to main / run 'Deploy Portfolio to EC2' workflow"
echo "  3) After healthy: sudo rm -rf /var/tmp/medzy-old-*"
echo "Done."
