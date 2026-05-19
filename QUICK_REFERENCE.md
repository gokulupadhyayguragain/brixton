# BRIXTON Friends - Quick Reference

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0 (if running locally)
- Git

### 5-Minute Setup
```bash
# Clone
git clone your-repo-url
cd dynamic

# Create config
cp backend/.env.example .env

# Start
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## 📋 API Quick Reference

### Auth
```bash
# Register
POST /api/auth/register
{ email, username, password, full_name }

# Login
POST /api/auth/login
{ email, password }
# Response: { token, userId, user }
```

### Friends
```bash
# Send request
POST /api/friends/request
{ recipient_id }

# Accept/Reject
POST /api/friends/accept { request_id }
POST /api/friends/reject { request_id }

# Get friends
GET /api/friends/list

# Search users
GET /api/users/search/john
```

### Chat
```bash
# Send message
POST /api/chat/send
{ recipient_id, content }

# Get messages
GET /api/chat/conversation/:friend_id

# Recent chats
GET /api/chat/recent
```

---

## 🐳 Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Shell into backend
docker-compose exec backend sh

# Shell into database
docker-compose exec mysql mysql -uroot -p

# Rebuild
docker-compose up --build
```

---

## 📊 Database Commands

```bash
# Connect to MySQL
docker-compose exec mysql mysql -uroot -p$DB_PASSWORD -D brixton_friends

# Useful queries
SELECT * FROM users LIMIT 5;
SELECT * FROM friendships WHERE user_id = 1;
SELECT * FROM messages WHERE recipient_id = 1 AND is_read = FALSE;

# Backup
docker-compose exec mysql mysqldump -uroot -p$DB_PASSWORD brixton_friends > backup.sql

# Restore
docker-compose exec -T mysql mysql -uroot -p$DB_PASSWORD brixton_friends < backup.sql
```

---

## 🔐 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_USER | DB username | root |
| DB_PASSWORD | DB password | secure123 |
| DB_NAME | Database name | brixton_friends |
| PORT | Backend port | 5000 |
| JWT_SECRET | Token secret | your_secret_key |
| CORS_ORIGIN | Frontend URL | http://localhost:3000 |

---

## 🚀 EC2 Deployment Quick Steps

```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-ip

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Clone & setup
sudo git clone your-repo-url
cd dynamic
sudo docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:5000/api/health
```

Full guide: See `EC2_DEPLOYMENT.md`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check if services are running: `docker-compose ps` |
| "Database connection failed" | Verify DB_PASSWORD in .env matches docker-compose.yml |
| "Cannot find module" | Run `npm install` in frontend/backend directories |
| "Port already in use" | Change port in docker-compose.yml or kill process |
| "Permission denied on database" | Reset database: `docker volume rm dynamic_mysql_data` |

---

## 📈 Performance Tips

1. **Indexing** - Already optimized in schema.sql
2. **Connection Pooling** - Configured (max 10 connections)
3. **Caching** - Use Redis for sessions (optional)
4. **CDN** - Serve static assets from S3 + CloudFront
5. **Database** - Consider RDS for production

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to strong value
- [ ] Use strong DB_PASSWORD
- [ ] Enable HTTPS in production
- [ ] Configure security groups on EC2
- [ ] Regular database backups
- [ ] Monitor logs for unusual activity
- [ ] Update dependencies regularly
- [ ] Use environment-specific configs

---

## 📞 Support Resources

- **README.md** - Full documentation
- **EC2_DEPLOYMENT.md** - Production deployment guide
- **ARCHITECTURE.md** - System design & multi-instance setup
- **API Documentation** - Inline in route files

---

## 🎯 Next Steps

1. ✅ Run locally: `docker-compose up -d`
2. ✅ Create account at http://localhost:3000
3. ✅ Test features (search, add friends, chat)
4. ✅ Review database: `docker-compose exec mysql mysql`
5. ✅ Deploy to EC2: See EC2_DEPLOYMENT.md
6. ✅ Enable federation: See ARCHITECTURE.md

---

**Happy building! 🚀**
