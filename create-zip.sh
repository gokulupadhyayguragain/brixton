#!/bin/bash
# Create ZIP file of BRIXTON Friends project
# Run this in the project root directory

echo "Creating brixton-friends.zip..."

# Create ZIP file (exclude unnecessary files)
zip -r brixton-friends.zip \
  frontend/ \
  backend/ \
  database/ \
  docker-compose.yml \
  docker-compose-prod.yml \
  deploy-aws.sh \
  .gitignore \
  START_HERE.md \
  WINDOWS_DEPLOYMENT_GUIDE.md \
  QUICK_REFERENCE.md \
  AWS_DEPLOYMENT_COMPLETE.md \
  TROUBLESHOOTING.md \
  README.md \
  STUDENT_VERSION_INFO.md \
  -x "*/node_modules/*" "*/dist/*" "*/.git/*" "*.log"

echo "✓ Created: brixton-friends.zip"
echo "Size: $(du -h brixton-friends.zip | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Download brixton-friends.zip"
echo "2. Extract on Windows"
echo "3. Follow WINDOWS_DEPLOYMENT_GUIDE.md"
