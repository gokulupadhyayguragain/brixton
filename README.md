# 🚀 BRIXTON Friends - Social Network

Complete full-stack social networking application with real-time messaging, friend management, and location tracking.

## 📦 What's Inside

```
brixton-friends/
├── 📂 frontend/              React app
├── 📂 backend/               Node.js API
├── 📂 database/              MySQL schema
├── 📄 deploy-aws.sh          Auto-deployment script ⭐
└── 📄 docker-compose-prod.yml Production setup
```

## ✨ Key Features

✅ Real-time messaging with Socket.io  
✅ Friend request/management system  
✅ Interactive maps (Leaflet)  
✅ User search and discovery  
✅ JWT authentication + secure passwords  
✅ 24/7 production deployment  
✅ Auto-restart on crash  
✅ Daily automated backups  

## 📚 Documentation Files

| File | Purpose | For |
|------|---------|-----|
| **START_HERE_WINDOWS.md** | Quick 5-step deployment guide | Students → Start here! |
| **WINDOWS_DEPLOYMENT_GUIDE.md** | Detailed step-by-step instructions | Students → Detailed help |
| **QUICK_REFERENCE.md** | Commands and useful references | Students → Quick lookup |
| **TROUBLESHOOTING.md** | Common issues and solutions | Students/Instructors → Problems? |
| **API_DOCS.md** | Complete API endpoint reference | Developers → API info |
| **INSTRUCTOR_DELIVERY_GUIDE.md** | How to deliver to students | Instructors → Teaching |
| **FINAL_DELIVERY_SUMMARY.md** | Project completion summary | Everyone → Overview |
| **README.md** | This file - project overview | Everyone → Start here |

## 🚀 Deployment (30 Minutes)

### For Students - Start Here!

**Read:** START_HERE_WINDOWS.md (inside the ZIP)

**Steps:**
1. Create AWS account (5 min)
2. Create EC2 instance (5 min)
3. Extract ZIP file (2 min)
4. Upload with SCP (2 min)
5. Run deploy script (10 min)
6. **Your app is live!** 🎉

### Local Development

```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MySQL: localhost:3306

## 🏗️ Technology Stack

**Frontend:** React 18, Leaflet maps, Socket.io  
**Backend:** Node.js, Express, Socket.io  
**Database:** MySQL 8.0  
**Deployment:** Docker, Nginx, AWS EC2  
**Auth:** JWT + bcryptjs  

## 📋 Architecture

```
┌──────────────┐
│ React App    │ Frontend
└──────┬───────┘
       │ HTTP
┌──────┴───────┐
│  Nginx       │ Reverse Proxy (Port 80)
└──────┬───────┘
       │
┌──────┴───────┐
│ Node.js API  │ Backend (40+ endpoints)
└──────┬───────┘
       │ SQL
┌──────┴───────┐
│ MySQL        │ Database (7 tables)
└──────────────┘
```

## 🔐 Security

✅ JWT authentication  
✅ Password hashing (bcryptjs)  
✅ SQL injection prevention  
✅ CORS protection  
✅ Helmet security headers  
✅ Input validation  

## 📊 Project Stats

- **Frontend:** 4 components, responsive design
- **Backend:** 4 route modules, 40+ endpoints
- **Database:** 7 tables, proper relationships
- **Documentation:** 8 comprehensive guides
- **Deployment:** Automated 14-step script
- **Status:** ✅ Production Ready

## 🎓 Learning Outcomes

- Full-stack development
- React components
- Node.js/Express APIs
- MySQL database design
- JWT authentication
- Real-time communication (Socket.io)
- Docker containerization
- AWS EC2 deployment
- DevOps fundamentals

## ❓ Getting Help

| Question | See |
|----------|-----|
| "Where do I start?" | START_HERE_WINDOWS.md |
| "How do I deploy?" | WINDOWS_DEPLOYMENT_GUIDE.md |
| "What's the API?" | API_DOCS.md |
| "I have a problem" | TROUBLESHOOTING.md |
| "What's a command?" | QUICK_REFERENCE.md |
| "How do I teach this?" | INSTRUCTOR_DELIVERY_GUIDE.md |

## ✅ Status

✅ Code complete and tested  
✅ Docker setup working  
✅ Deployment script automated  
✅ Windows guide included  
✅ Documentation comprehensive  
✅ Auto-restart configured  
✅ Daily backups enabled  
✅ Ready for students  

## 🚀 Ready to Deploy?

**Students:** Download ZIP → Read START_HERE_WINDOWS.md → Deploy in 30 min!

**Instructors:** See INSTRUCTOR_DELIVERY_GUIDE.md

---

**Status:** ✅ Complete | **Version:** 1.0 | **Date:** May 2026 | **Windows Ready!** 🪟
