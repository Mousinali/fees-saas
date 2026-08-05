# Deployment Guide: Hostinger KVM 1 Plan (Ubuntu)

This guide walks you through deploying your **Fees Management SaaS** (Next.js + MongoDB) onto a Hostinger KVM 1 VPS.

## Prerequisites
1. **Hostinger KVM 1 VPS** running **Ubuntu 22.04 or 24.04**.
2. A domain name pointed to your VPS's IP address (e.g., via A Record in your DNS settings).
3. SSH Access to your VPS.

---

## Step 1: Connect to your VPS
Open your terminal and connect to your VPS using SSH:
```bash
ssh root@<your_vps_ip_address>
```
*Update your server packages right after logging in:*
```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 2: Install Node.js & PM2
We will use NodeSource to install a modern version of Node.js.

```bash
# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Install PM2 globally (to keep your app running in the background)
sudo npm install -g pm2
```

---

## Step 3: Install MongoDB (Local Database)
Since the KVM 1 plan has 4GB of RAM, it is perfectly capable of running MongoDB locally.

```bash
# Import MongoDB public GPG Key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload local package database and install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB to run on startup
sudo systemctl start mongod
sudo systemctl enable mongod
```
*Your MongoDB connection string will be: `mongodb://localhost:27017/fees-management`*

*(Alternatively, you can use a free cloud database like MongoDB Atlas and skip this step).*

---

## Step 4: Clone & Setup Your Application

```bash
# Install Git if not already installed
sudo apt install git -y

# Navigate to the web directory
cd /var/www

# Clone your repository (Replace with your actual git URL)
# If your repo is private, you may need to generate SSH keys or use a personal access token.
git clone <your_repository_url> fees-saas
cd fees-saas

# Install dependencies
npm install

# Create your .env file
nano .env
```

Paste your environment variables inside the `.env` file. For example:
```env
MONGODB_URI=mongodb://localhost:27017/fees-management
JWT_SECRET=your_super_secret_jwt_key
PORT=3000
# Add any other required variables
```
*Press `CTRL + X`, then `Y`, then `Enter` to save and exit.*

```bash
# Build the Next.js application
npm run build
```

---

## Step 5: Start the App with PM2
Start your Next.js application using PM2 so it stays alive if the server restarts.

```bash
pm2 start npm --name "fees-saas" -- start
pm2 save
pm2 startup
```
*Follow the on-screen instructions given by the `pm2 startup` command.*

---

## Step 6: Install & Configure Nginx (Reverse Proxy)
We need Nginx to route traffic from port 80 (HTTP) and 443 (HTTPS) to your Next.js app running on port 3000.

```bash
sudo apt install nginx -y
```

Create a new Nginx configuration file for your app:
```bash
sudo nano /etc/nginx/sites-available/fees-saas
```

Paste the following configuration (Replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*Save and exit (`CTRL + X`, then `Y`, then `Enter`).*

Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/fees-saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: Secure with SSL (HTTPS)
Use Certbot to automatically fetch and configure a free SSL certificate from Let's Encrypt.

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Request SSL Certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically update your Nginx configuration to enforce HTTPS.

---

## 🎉 You're Done!
Your Fees Management SaaS is now live, securely running on your Hostinger KVM 1 VPS!
