#!/bin/bash
# Database setup script

MYSQL_USER=${1:-root}
MYSQL_PASSWORD=${2:-}
MYSQL_HOST=${3:-localhost}

echo "🔧 Setting up BRIXTON Friends Database..."

if [ -z "$MYSQL_PASSWORD" ]; then
  mysql -u $MYSQL_USER -h $MYSQL_HOST < schema.sql
else
  mysql -u $MYSQL_USER -p"$MYSQL_PASSWORD" -h $MYSQL_HOST < schema.sql
fi

if [ $? -eq 0 ]; then
  echo "✅ Database setup completed successfully!"
else
  echo "❌ Database setup failed!"
  exit 1
fi
