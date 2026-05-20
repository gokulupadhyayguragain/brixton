#!/bin/bash
# EC2 user-data script for fully automated BRIXTON Friends deployment on Ubuntu 22.04
# Usage: paste this script in EC2 "User data" field when launching instance.

set -euxo pipefail

exec > >(tee -a /var/log/brixton-userdata.log) 2>&1

export DEBIAN_FRONTEND=noninteractive
export REPO_URL="https://github.com/gokulupadhyayguragain/brixton.git"
export REPO_BRANCH="main"
export PROJECT_DIR="/opt/brixton-friends"

retry() {
  local attempts=$1
  local wait_secs=$2
  shift 2
  local n=1
  until "$@"; do
    if [ "$n" -ge "$attempts" ]; then
      return 1
    fi
    n=$((n + 1))
    sleep "$wait_secs"
  done
}

retry 10 15 apt-get update
retry 5 15 apt-get install -y git curl

if [ -d "$PROJECT_DIR/.git" ]; then
  cd "$PROJECT_DIR"
  git fetch origin
  git checkout "$REPO_BRANCH"
  git pull origin "$REPO_BRANCH"
else
  rm -rf "$PROJECT_DIR"
  git clone --branch "$REPO_BRANCH" "$REPO_URL" "$PROJECT_DIR"
fi

chmod +x "$PROJECT_DIR/deploy-aws.sh"
bash "$PROJECT_DIR/deploy-aws.sh"

echo "Brixton deployment completed at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > /var/log/brixton-success.log
