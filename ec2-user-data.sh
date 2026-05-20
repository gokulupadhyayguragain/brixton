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
retry 5 15 apt-get install -y git curl nginx

# Replace default Nginx page immediately so users know automation is running.
cat > /var/www/html/index.html << 'EOF'
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BRIXTON Friends Deploying</title>
  <style>
    body { font-family: Arial, sans-serif; background: #111; color: #f3f3f3; margin: 0; display: grid; place-items: center; height: 100vh; }
    .card { max-width: 620px; padding: 24px; border: 1px solid #333; border-radius: 10px; background: #1b1b1b; }
    h1 { margin-top: 0; color: #7ee787; }
    code { color: #f2cc60; }
  </style>
</head>
<body>
  <div class="card">
    <h1>BRIXTON Friends is deploying...</h1>
    <p>Server bootstrap is in progress. This can take 10-20 minutes on first launch.</p>
    <p>If this page stays longer than 25 minutes, check:</p>
    <p><code>/var/log/cloud-init-output.log</code><br/><code>/var/log/brixton-userdata.log</code></p>
  </div>
</body>
</html>
EOF

systemctl enable nginx
systemctl restart nginx

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
retry 3 20 bash "$PROJECT_DIR/deploy-aws.sh"

echo "Brixton deployment completed at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > /var/log/brixton-success.log
