# 🪟 Windows Deployment Guide - Git Bash SSH/SCP

## For Windows Users - Complete Guide

> **This is for students using Windows computers with Git Bash**

## 🤖 Zero-Touch Option (No SCP/SSH)

If you want full automation with EC2 User data:

1. Launch Ubuntu 22.04 EC2
2. In Advanced details -> User data, paste:

```bash
#!/bin/bash
curl -fsSL https://raw.githubusercontent.com/gokulupadhyayguragain/brixton/main/ec2-user-data.sh | bash
```

3. Launch the instance
4. Wait 10-15 minutes
5. Open `http://YOUR_EC2_PUBLIC_IP`

No SCP and no SSH are required in this mode.

---

## 📋 What You Need

✅ Windows 10 or 11
✅ Git Bash (free, 5 min install)
✅ EC2 keypair (.pem file)
✅ Project ZIP file
✅ Your EC2 public IP

---

## 🔧 Step 1: Install Git Bash (If Needed)

**Download:**
- Go to: https://git-scm.com/download/win
- Click "64-bit Git for Windows Setup"
- Run installer, use all default settings
- Restart your computer

**Verify Installation:**
- Search for "Git Bash" in Windows menu
- Click to open
- You should see a terminal window
- Type: `git --version` (should show version number)

---

## 📁 Step 2: Prepare Your Files

### Create Working Directory
```
C:\Users\YourName\brixton-friends\
```

### What Goes Inside:
1. **Extract the ZIP file** you received
2. **Create `.ssh` folder:**
   ```
   C:\Users\YourName\.ssh\
   ```
3. **Save your EC2 keypair** to:
   ```
   C:\Users\YourName\.ssh\brixton-key.pem
   ```

**Important:** Make sure the folder structure looks like:
```
C:\Users\YourName\
├── brixton-friends\           ← Project files here
│   ├── frontend/
│   ├── backend/
│   ├── database/
│   ├── deploy-aws.sh
│   └── ... (other files)
└── .ssh\
    └── brixton-key.pem         ← Key here
```

---

## 🔐 Step 3: Set Key Permissions (IMPORTANT!)

**In Git Bash:**

```bash
# Open Git Bash
# Type these commands exactly:

cd ~/.ssh

# Check the key exists
ls -la brixton-key.pem

# Make it readable only by you (IMPORTANT!)
chmod 400 brixton-key.pem

# Verify permissions changed
ls -la brixton-key.pem
# Should show: -r--------
```

---

## 📤 Step 4: Upload Project with SCP

**In Git Bash:**

```bash
# Navigate to project folder
cd ~/brixton-friends

# Upload EVERYTHING (replace 54.123.45.67 with your EC2 IP)
scp -r -i ~/.ssh/brixton-key.pem . ubuntu@54.123.45.67:/opt/brixton-friends

# This will take 1-2 minutes
# You'll see files uploading...
```

**Note:** Replace `54.123.45.67` with your **actual EC2 public IP**

---

## 🔗 Step 5: SSH into Server

**In Git Bash:**

```bash
# SSH into your server (replace IP with yours)
ssh -i ~/.ssh/brixton-key.pem ubuntu@54.123.45.67

# You'll see:
# The authenticity of host...
# Type: yes
# Then you'll see: ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

**You're now inside the server!** ✓

---

## 🚀 Step 6: Run Deployment

**Still in SSH terminal:**

```bash
# Navigate to project
cd /opt/brixton-friends

# Make script executable
chmod +x deploy-aws.sh

# Run deployment
sudo bash deploy-aws.sh localhost admin@example.com

# Watch it deploy (takes 10-15 minutes)
# You'll see green checkmarks as each step completes ✓
```

---

## 🌐 Step 7: Access Your App

**After deployment completes:**

1. Open your web browser
2. Go to: `http://54.123.45.67` (use YOUR EC2 IP)
3. **Your app is live!** 🎉

---

## 📚 Git Bash Commands Reference

### Basic Navigation
```bash
# See current folder
pwd

# List files
ls -la

# Go to home directory
cd ~

# Go to .ssh folder
cd ~/.ssh

# Go back one folder
cd ..

# Create folder
mkdir foldername

# Remove file
rm filename
```

### SSH/SCP Commands
```bash
# Connect to server
ssh -i ~/.ssh/brixton-key.pem ubuntu@YOUR-IP

# Copy files TO server
scp -i ~/.ssh/brixton-key.pem file.txt ubuntu@YOUR-IP:/path/

# Copy folder TO server
scp -r -i ~/.ssh/brixton-key.pem ./folder ubuntu@YOUR-IP:/path/

# Copy FROM server to local
scp -i ~/.ssh/brixton-key.pem ubuntu@YOUR-IP:/path/file.txt ./

# Exit SSH
exit
```

---

## ⚠️ Common Windows Issues & Fixes

### Issue: "Permission denied (publickey)"
**Fix:**
```bash
# Check key has correct permissions
ls -la ~/.ssh/brixton-key.pem

# Should show: -r--------
# If not, fix it:
chmod 400 ~/.ssh/brixton-key.pem
```

### Issue: "No such file or directory"
**Fix:**
```bash
# Check you're in right folder
pwd

# Should show: /c/Users/YourName/brixton-friends
# If not:
cd ~/brixton-friends
```

### Issue: "Connection refused"
**Fix:**
- Check your EC2 IP is correct
- Check security group allows port 22
- Wait a minute (instance might still be starting)

### Issue: "SCP command not found"
**Fix:**
- Make sure you're using Git Bash (not Command Prompt)
- Git Bash should have scp pre-installed

### Issue: Can't find .ssh folder
**Fix:**
```bash
# Create it manually
mkdir ~/.ssh

# Verify it exists
ls -la ~
```

---

## 🔄 Copy Files Back From Server

**If you need to download files from server:**

```bash
# In Git Bash (NOT in SSH)
cd ~/brixton-friends

# Download logs
scp -r -i ~/.ssh/brixton-key.pem ubuntu@54.123.45.67:/opt/brixton-friends/logs ./

# Download database backup
scp -i ~/.ssh/brixton-key.pem ubuntu@54.123.45.67:/opt/brixton-backups/backup*.sql.gz ./
```

---

## 💾 Useful Server Commands (While in SSH)

```bash
# View logs
docker compose -f /opt/brixton-friends/docker-compose-prod.yml logs -f

# Stop services
docker compose -f /opt/brixton-friends/docker-compose-prod.yml down

# Start services
docker compose -f /opt/brixton-friends/docker-compose-prod.yml up -d

# Check status
docker compose -f /opt/brixton-friends/docker-compose-prod.yml ps

# Check server IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Exit SSH
exit
```

---

## 📋 Complete Windows Deployment Checklist

- [ ] Git Bash installed
- [ ] Project ZIP extracted to `~/brixton-friends/`
- [ ] EC2 keypair saved to `~/.ssh/brixton-key.pem`
- [ ] Permissions set: `chmod 400 ~/.ssh/brixton-key.pem`
- [ ] EC2 instance created (Ubuntu 22.04, t3.micro)
- [ ] Security group allows HTTP (80), HTTPS (443), SSH (22)
- [ ] SCP uploaded files: `scp -r ...`
- [ ] SSH connected: `ssh -i ...`
- [ ] Deploy script ran: `sudo bash deploy-aws.sh`
- [ ] App loads at: `http://YOUR-EC2-IP`
- [ ] Can register and login
- [ ] App is working! 🎉

---

## 🆘 Help! Something's Wrong

### Step 1: Check SSH Connection
```bash
ssh -v -i ~/.ssh/brixton-key.pem ubuntu@YOUR-IP
# The -v flag shows verbose details of what's happening
```

### Step 2: Check Files Were Uploaded
```bash
# While in SSH
ls -la /opt/brixton-friends/
# Should show frontend, backend, database, deploy-aws.sh, etc
```

### Step 3: Check Deployment Logs
```bash
# While in SSH
tail -100 /var/log/syslog | grep deploy
# Shows recent deployment messages
```

### Step 4: Check Services Status
```bash
# While in SSH
docker compose -f /opt/brixton-friends/docker-compose-prod.yml ps
# Shows if containers are running
```

---

## 🎯 Quick Summary

**Windows User Workflow:**

1. ✅ Install Git Bash
2. ✅ Extract project ZIP
3. ✅ Save EC2 keypair to `~/.ssh/brixton-key.pem`
4. ✅ Fix permissions: `chmod 400 ~/.ssh/brixton-key.pem`
5. ✅ Upload: `scp -r -i ~/.ssh/brixton-key.pem . ubuntu@IP:/opt/brixton-friends`
6. ✅ Connect: `ssh -i ~/.ssh/brixton-key.pem ubuntu@IP`
7. ✅ Deploy: `sudo bash deploy-aws.sh localhost admin@example.com`
8. ✅ Open browser: `http://YOUR-EC2-IP`
9. ✅ **Done! App is live! 🚀**

---

## 🎓 What You Just Learned

✅ How to use Git Bash on Windows
✅ How to manage SSH keys securely
✅ How to upload files with SCP
✅ How to connect to Linux servers from Windows
✅ How to deploy applications to AWS
✅ Basic Linux server administration

**Congratulations! You're now a cloud developer! 🎉**

---

## 📞 Troubleshooting Flowchart

```
Issue: Can't run scp command
├─ Are you using Git Bash? (not Command Prompt)
├─ YES → Check if Git Bash is in PATH
└─ NO → Use Git Bash instead

Issue: Permission denied
├─ Is key 400 permissions? (chmod 400)
├─ YES → Check IP address
└─ NO → Set permissions

Issue: Connection refused
├─ Is EC2 running? (check AWS console)
├─ YES → Check security group
└─ NO → Start instance

Issue: File not found
├─ Is path correct? (pwd to check)
├─ YES → Does file exist? (ls to check)
└─ NO → Navigate to correct folder
```

---

## ✨ Tips for Success

✅ **Always use full paths** - `/c/Users/YourName/.ssh/brixton-key.pem` not `~`
✅ **Replace YOUR-IP** - Don't forget to use actual EC2 IP
✅ **Check capitalization** - Linux is case-sensitive
✅ **Use Tab key** - Autocomplete file names in Git Bash
✅ **Keep terminal open** - SSH session persists until you `exit`
✅ **Save credentials** - Backup your .pem file somewhere safe

---

**Ready to deploy? Start with Step 1! 🚀**
