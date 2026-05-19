# BRIXTON Friends - Troubleshooting Guide

## Common Issues & Solutions

### 🚀 Startup Issues

#### Docker Compose Won't Start
```bash
# Issue: "docker-compose: command not found"
# Solution:
sudo apt-get install docker-compose-plugin
# or
pip install docker-compose

# Verify:
docker-compose --version
```

#### Port Already in Use
```bash
# Issue: "Port 5000 is already allocated"
# Solution 1: Change port in docker-compose.yml
services:
  backend:
    ports:
      - "5001:5000"  # Changed from 5000

# Solution 2: Kill existing process
sudo lsof -ti:5000 | xargs kill -9
```

#### MySQL Won't Connect
```bash
# Issue: "Access denied for user 'root'"
# Check credentials:
grep DB_PASSWORD .env

# Reset database:
docker-compose down -v
docker-compose up -d

# Manual reset:
docker-compose exec mysql mysql -uroot -p
> DROP DATABASE brixton_friends;
> CREATE DATABASE brixton_friends;
```

---

### 📝 Database Issues

#### Database Not Initializing
```bash
# Check logs:
docker-compose logs mysql

# Manual schema import:
docker-compose exec -T mysql mysql -uroot -p$DB_PASSWORD < database/schema.sql

# Verify tables exist:
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD -e "USE brixton_friends; SHOW TABLES;"
```

#### Slow Queries
```bash
# Enable query log:
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD
> SET GLOBAL slow_query_log = 'ON';
> SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

# Check indexes:
SELECT * FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'brixton_friends';

# Add missing index:
ALTER TABLE messages ADD INDEX idx_created_at (created_at);
```

#### Out of Disk Space
```bash
# Check disk usage:
df -h
docker system df

# Clean up:
docker system prune -a
docker volume prune

# Backup and delete old data:
docker-compose exec mysql mysqldump -uroot -p$DB_PASSWORD brixton_friends > backup.sql
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD -e "TRUNCATE brixton_friends.messages;"
```

---

### 🔐 Authentication Issues

#### Invalid Token Error
```
Error: "Invalid token"
```

**Solutions:**
1. Token expired - re-login
2. JWT_SECRET mismatch - verify .env JWT_SECRET
3. Token format wrong - should be "Bearer <token>"
4. Wrong bearer scheme - must be uppercase "Bearer"

```javascript
// Check token:
const token = localStorage.getItem('token');
console.log('Token:', token);

// Validate token:
const decoded = jwt.decode(token);
console.log('Decoded:', decoded);
```

#### Token Not Sent in Request
```javascript
// ❌ Wrong
const response = await axios.get('/api/users/1');

// ✅ Correct
const token = localStorage.getItem('token');
const response = await axios.get('/api/users/1', {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Check CORS_ORIGIN in .env
2. Frontend URL must match CORS_ORIGIN
3. Verify headers in response

```bash
# Test CORS:
curl -X OPTIONS http://localhost:5000/api/users/1 \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"
```

---

### 🌐 Network Issues

#### Cannot Reach Backend
```bash
# Check if service is running:
docker-compose ps

# Test locally:
curl http://localhost:5000/api/health

# From frontend container:
docker-compose exec frontend curl http://backend:5000/api/health

# Network issues:
docker network ls
docker network inspect dynamic_brixton_network
```

#### Socket.io Connection Failed
```javascript
// Socket won't connect - check backend address
const socket = io('http://localhost:5000');  // ❌ Wrong if in Docker

// In Docker, use service name:
const socket = io('http://backend:5000');  // ✅ Correct

// From browser (not in Docker):
const socket = io('http://localhost:5000');  // ✅ Correct
```

#### Frontend Can't Find Backend
```bash
# Check environment variable:
echo $REACT_APP_API_URL

# Update in .env:
REACT_APP_API_URL=http://localhost:5000

# Rebuild frontend:
docker-compose up --build frontend
```

---

### 🎯 Feature Issues

#### Friends List Empty
```bash
# 1. Check if friends exist in database
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD -D brixton_friends
> SELECT * FROM friendships WHERE user_id = 1;

# 2. Send test friend request
curl -X POST http://localhost:5000/api/friends/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":2}'

# 3. Check friend_requests table
> SELECT * FROM friend_requests;

# 4. Accept request
curl -X POST http://localhost:5000/api/friends/accept \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"request_id":1}'

# 5. Verify friendship created
> SELECT * FROM friendships;
```

#### Map Not Showing Friends
```javascript
// Check if geolocation works
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => console.log('Location:', position.coords),
    error => console.error('Geolocation error:', error)
  );
}

// Manually update location:
curl -X POST http://localhost:5000/api/users/update-location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":51.5074,"longitude":-0.1278}'

// Verify in database:
SELECT id, full_name, latitude, longitude FROM users;
```

#### Chat Messages Not Sending
```javascript
// Check socket connection
const socket = io('...');
socket.on('connect', () => console.log('Connected:', socket.id));
socket.on('connect_error', (error) => console.error('Error:', error));

// Check message API
curl -X POST http://localhost:5000/api/chat/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":2,"content":"Test"}'

# Check messages in database:
SELECT * FROM messages;
```

#### Messages Not Loading
```bash
# Check conversation endpoint:
curl -X GET http://localhost:5000/api/chat/conversation/2 \
  -H "Authorization: Bearer $TOKEN"

# Check database:
SELECT * FROM messages 
WHERE (sender_id = 1 AND recipient_id = 2) 
   OR (sender_id = 2 AND recipient_id = 1);

# Check permissions:
SELECT * FROM privacy_settings WHERE user_id = 2;
```

---

### 📱 Frontend Issues

#### Blank Page on Load
```bash
# Check console errors:
# Open DevTools (F12) > Console

# Check if React mounted:
console.log('React version:', React.version)

# Verify backend is running:
curl http://localhost:5000/api/health

# Rebuild frontend:
docker-compose down frontend
docker-compose up --build frontend
```

#### "Cannot find module" Errors
```bash
# Reinstall dependencies:
docker-compose down
docker-compose up --build frontend

# Or manually:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Styling Not Applied
```bash
# Check CSS file:
ls frontend/src/App.css

# Rebuild:
docker-compose up --build frontend

# Clear cache:
# Chrome: Ctrl+Shift+Delete
# Hard refresh: Ctrl+Shift+R
```

---

### 🔧 Performance Issues

#### Slow Response Times
```bash
# Check backend logs:
docker-compose logs backend

# Enable debug logging:
# Add to backend/server.js:
app.use((req, res, next) => {
  console.time(`${req.method} ${req.path}`);
  res.on('finish', () => {
    console.timeEnd(`${req.method} ${req.path}`);
  });
  next();
});

# Check database performance:
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD
> EXPLAIN SELECT * FROM messages WHERE recipient_id = 1 LIMIT 50;

# Analyze tables:
> ANALYZE TABLE messages;
> OPTIMIZE TABLE messages;
```

#### High Memory Usage
```bash
# Check container memory:
docker stats

# Limit memory (docker-compose.yml):
services:
  backend:
    mem_limit: 512m
    memswap_limit: 512m

# Restart service:
docker-compose restart backend

# Check Node process:
docker-compose exec backend ps aux
```

#### Database Too Large
```bash
# Check size:
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD -e \
  "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) 
   FROM information_schema.TABLES 
   WHERE table_schema = 'brixton_friends';"

# Archive old messages:
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD -D brixton_friends
> DELETE FROM messages WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

# Optimize:
> OPTIMIZE TABLE messages;
```

---

### 🐳 Docker Issues

#### Container Exits Immediately
```bash
# Check logs:
docker-compose logs backend

# Common cause - port conflict:
docker-compose ps -a

# Restart:
docker-compose restart backend

# Rebuild:
docker-compose up --build backend
```

#### "Service is already running"
```bash
# Check processes:
ps aux | grep docker

# Kill stuck process:
pkill -f docker-compose

# Restart Docker daemon:
sudo systemctl restart docker
```

#### Cannot Build Image
```bash
# Check Docker daemon:
docker info

# Clean up:
docker system prune -a

# Build with verbose output:
docker-compose build --no-cache --progress=plain backend

# Check Dockerfile:
cat backend/Dockerfile
```

---

### 🌍 EC2 Deployment Issues

#### SSH Connection Refused
```bash
# Check security group:
aws ec2 describe-security-groups

# Check key permissions:
chmod 600 your-key.pem

# Verify EC2 is running:
aws ec2 describe-instances
```

#### Cannot Pull Repository
```bash
# Verify credentials:
git config --list

# Use HTTPS with token (if HTTPS):
git clone https://token@github.com/user/repo.git

# SSH (if SSH):
ssh-add your-key
git clone git@github.com:user/repo.git
```

#### Services Won't Start on EC2
```bash
# SSH into instance:
ssh -i key.pem ubuntu@ip

# Check Docker:
docker --version
docker-compose --version

# Start services:
cd /opt/brixton-friends
docker-compose up -d

# View logs:
docker-compose logs backend

# Restart:
sudo systemctl restart docker
docker-compose restart
```

#### Traffic Not Reaching App
```bash
# Check security group inbound rules:
# Port 80 (HTTP)
# Port 443 (HTTPS)
# Port 3000 (Frontend, if needed)
# Port 5000 (Backend, if needed)

# Test connectivity:
curl http://your-ec2-public-ip/api/health

# Check Nginx (if using):
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

### 📊 Monitoring & Debugging

#### Enable Debug Logging
```javascript
// backend/server.js
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });
}
```

#### Database Query Logging
```bash
# Enable in MySQL:
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD
> SET GLOBAL general_log = 'ON';
> SELECT @@global.log_output;

# View logs:
docker-compose logs mysql
```

#### Check System Resources
```bash
# CPU and Memory:
docker stats

# Disk usage:
df -h
docker system df

# Network:
docker network ls
docker network inspect dynamic_brixton_network

# File permissions:
ls -la /opt/brixton-friends/
```

---

### 🆘 Getting Help

**Before posting issues:**
1. Check logs: `docker-compose logs`
2. Verify .env configuration
3. Test locally: `curl http://localhost:5000/api/health`
4. Check database: `docker-compose exec mysql mysql`
5. Review error messages carefully

**Create issue with:**
- Error message (full text)
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Docker version, etc.)
- Logs (sanitized, no credentials)

---

## Quick Diagnostic

Run this to check system health:

```bash
#!/bin/bash
echo "=== Docker Info ==="
docker-compose ps

echo "=== Backend Health ==="
curl http://localhost:5000/api/health

echo "=== Database Connection ==="
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD -e "SELECT 1;"

echo "=== Tables ==="
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD brixton_friends -e "SHOW TABLES;"

echo "=== User Count ==="
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD brixton_friends -e "SELECT COUNT(*) FROM users;"

echo "=== Disk Usage ==="
docker system df

echo "=== Container Logs (last 10 lines) ==="
docker-compose logs --tail=10
```

Save as `diagnose.sh` and run: `bash diagnose.sh`

---

**Can't find solution?** 
- Check all 3 docs: README.md, START_HERE_WINDOWS.md, QUICK_REFERENCE.md
- Review the API_DOCS.md for endpoint details
- Check WINDOWS_DEPLOYMENT_GUIDE.md for full deployment flow
