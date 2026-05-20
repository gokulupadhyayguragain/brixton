# 🪟 WINDOWS USERS - START HERE (Super Simple!)

## ⚡ 5-Minute Overview

You have a complete social network app. Just 5 simple steps to make it live:

1. **Get AWS account** (free)
2. **Get EC2 server** (free tier, ~3 minutes)
3. **Install Git Bash** (if not already installed)
4. **Upload files with SCP**
5. **Run deploy script**
6. **Done! Visit your IP in browser** 🎉

Or use the fully automated method below (no SCP, no SSH).

---

## 🤖 Fully Automated EC2 Method (No SCP/SSH)

If you want true zero-touch deployment:

1. Launch EC2 with Ubuntu 22.04 LTS
2. In Advanced details -> User data, paste:

```bash
#!/bin/bash
curl -fsSL https://raw.githubusercontent.com/gokulupadhyayguragain/brixton/main/ec2-user-data.sh | bash
```

3. Launch instance
4. Wait 10-15 minutes
5. Open `http://YOUR_EC2_PUBLIC_IP`

That is all. The instance will auto-clone from GitHub and auto-deploy everything.

---

## 📋 You Need:

✅ AWS Account (free)  
✅ Git Bash (free, 5 min install)  
✅ `brixton-friends.zip` file  
✅ EC2 `.pem` keypair  

---

## 🎯 STEP-BY-STEP (30 minutes total)

### STEP 1: AWS Account (2 min)

Go to: https://aws.amazon.com → Create Account

Done!

---

### STEP 2: Create EC2 Server (5 min)

**AWS Console:**
1. Go to: EC2 → Launch Instance
2. Name: `brixton-friends`
3. OS: **Ubuntu 22.04 LTS**
4. Type: **t3.micro** (free tier!)
5. Storage: 20 GB
6. Click "Launch"
7. **Download keypair** (save it!)

**Save:**
- Keypair file (`.pem`)
- Your EC2 public IP (copy from EC2 console)

---

### STEP 3: Install Git Bash (5 min)

**If you don't have it:**
1. Download: https://git-scm.com/download/win
2. Install (use all defaults)
3. Restart computer
4. Search "Git Bash" → Open it

**Verify:**
```bash
git --version
```

---

### STEP 4: Prepare Files (5 min)

**On Windows:**

1. Extract `brixton-friends.zip` to:
   ```
   C:\Users\YourName\brixton-friends\
   ```

2. Create folder:
   ```
   C:\Users\YourName\.ssh\
   ```

3. Copy your `.pem` keypair file to:
   ```
   C:\Users\YourName\.ssh\brixton-key.pem
   ```

**In Git Bash:**
```bash
cd ~/.ssh
chmod 400 brixton-key.pem
ls -la brixton-key.pem
# Should show: -r--------
```

---

### STEP 5: Upload Files (2 min)

**In Git Bash:**

```bash
cd ~/brixton-friends

# Replace 54.123.45.67 with YOUR EC2 IP!
scp -r -i ~/.ssh/brixton-key.pem . ubuntu@54.123.45.67:/opt/brixton-friends

# Wait 1-2 minutes...
# You'll see files uploading
```

---

### STEP 6: Run Deploy (10 min)

**In Git Bash:**

```bash
# Connect to server (replace IP with yours)
ssh -i ~/.ssh/brixton-key.pem ubuntu@54.123.45.67

# You'll see: ubuntu@ip-xxx-xxx-xxx-xxx:~$
# You're now inside the server! ✓

# Run deployment
cd /opt/brixton-friends
sudo bash deploy-aws.sh localhost admin@example.com

# Wait 10-15 minutes...
# You'll see: ✓ ✓ ✓ (green checkmarks)
# Then: 🎉 BRIXTON Friends is LIVE!
```

---

### STEP 7: Access Your App! (1 min)

**Open your browser:**

```
http://54.123.45.67
```

(Replace `54.123.45.67` with YOUR EC2 IP)

**You should see:**
- BRIXTON Friends login page
- Register button
- Everything working! 🎉

---

## ✅ Done!

Your app is now **LIVE** and **RUNNING 24/7**!

- ✅ Auto-restarts if it crashes
- ✅ Auto-restarts if server reboots
- ✅ Daily backups run automatically
- ✅ Free for 12 months (then ~$10/month)

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Permission denied" | Run: `chmod 400 ~/.ssh/brixton-key.pem` |
| "scp: command not found" | Make sure you're using Git Bash (not Command Prompt) |
| Website won't load | Wait a few minutes, server might still be starting |
| Can't SSH | Check your IP is correct, check security group allows port 22 |

If using EC2 User data automation, check logs on instance:
- `/var/log/cloud-init-output.log`
- `/var/log/brixton-userdata.log`
- `/var/log/brixton-success.log`

---

## 📚 More Help

- **Full Windows guide:** `WINDOWS_DEPLOYMENT_GUIDE.md`
- **Common issues:** `TROUBLESHOOTING.md`
- **All commands:** `QUICK_REFERENCE.md`
- **Project overview:** `README.md`

---

## 🎯 Key Commands (Copy/Paste)

### Step 4 - Set Key Permissions:
```bash
cd ~/.ssh
chmod 400 brixton-key.pem
```

### Step 5 - Upload Files:
```bash
cd ~/brixton-friends
scp -r -i ~/.ssh/brixton-key.pem . ubuntu@54.123.45.67:/opt/brixton-friends
```

### Step 6a - Connect via SSH:
```bash
ssh -i ~/.ssh/brixton-key.pem ubuntu@54.123.45.67
```

### Step 6b - Run Deploy (Inside SSH):
```bash
cd /opt/brixton-friends
sudo bash deploy-aws.sh localhost admin@example.com
```

### To Exit SSH:
```bash
exit
```

---

## 💡 Important Notes

✅ Replace `54.123.45.67` with YOUR actual EC2 public IP

✅ The `.pem` file is like a password - keep it safe!

✅ Write down your EC2 IP somewhere

✅ Save the database password (shown in deployment logs)

---

## 🎉 You're Done!

Your BRIXTON Friends social network is now:
- ✅ Running on AWS
- ✅ Accessible to anyone at your IP
- ✅ Automatically backed up daily
- ✅ Will auto-restart if needed
- ✅ Free for 12 months!

**Congratulations! You're a cloud developer! 🚀**

---

## 📞 Need Help?

Check these files (in order of usefulness):

1. **WINDOWS_DEPLOYMENT_GUIDE.md** - Detailed Windows instructions
2. **TROUBLESHOOTING.md** - Common problems & solutions
3. **QUICK_REFERENCE.md** - All useful commands
4. **README.md** - Project overview

---

**Ready? Start with AWS account creation! 🚀**
