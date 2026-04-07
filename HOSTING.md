# BridgeScale Platform — Complete Hosting & DNS Setup Guide

This guide walks you through purchasing a domain, setting up DNS, and deploying the full platform (Next.js frontend + NestJS backend + PostgreSQL + Redis) to production. It covers the **recommended path** (Vercel + Railway — fastest, cheapest, no server management) and the **advanced path** (a VPS like DigitalOcean — more control).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Before You Start — Checklist](#2-before-you-start--checklist)
3. [Step 1 — Purchase a Domain](#3-step-1--purchase-a-domain)
4. [Step 2 — Choose Your Hosting Stack](#4-step-2--choose-your-hosting-stack)
5. [Step 3 — Set Up the Database (PostgreSQL)](#5-step-3--set-up-the-database-postgresql)
6. [Step 4 — Set Up Redis](#6-step-4--set-up-redis)
7. [Step 5 — Deploy the Backend (NestJS)](#7-step-5--deploy-the-backend-nestjs)
8. [Step 6 — Deploy the Frontend (Next.js)](#8-step-6--deploy-the-frontend-nextjs)
9. [Step 7 — Configure DNS](#9-step-7--configure-dns)
10. [Step 8 — Enable SSL / HTTPS](#10-step-8--enable-ssl--https)
11. [Step 9 — Set All Environment Variables](#11-step-9--set-all-environment-variables)
12. [Step 10 — Run Database Migrations & Seed](#12-step-10--run-database-migrations--seed)
13. [Step 11 — Post-Deployment Checklist](#13-step-11--post-deployment-checklist)
14. [Advanced Path — Full VPS (DigitalOcean / AWS)](#14-advanced-path--full-vps-digitalocean--aws)
15. [Ongoing Maintenance](#15-ongoing-maintenance)
16. [Cost Estimate](#16-cost-estimate)

---

## 1. Architecture Overview

```
Internet
   │
   ├──▶ bridgescale.com          (frontend — Next.js on Vercel)
   │
   └──▶ api.bridgescale.com      (backend — NestJS on Railway / VPS)
              │
              ├──▶ PostgreSQL    (Railway managed DB / Supabase)
              └──▶ Redis         (Upstash / Railway Redis)
```

| Component       | Technology    | Recommended Host  |
|-----------------|---------------|-------------------|
| Frontend        | Next.js 14    | Vercel            |
| Backend API     | NestJS        | Railway           |
| Database        | PostgreSQL 16 | Railway / Supabase|
| Cache / Session | Redis 7       | Upstash           |
| Email           | Resend        | resend.com        |
| Payments        | Razorpay / Stripe | razorpay.com / stripe.com |

---

## 2. Before You Start — Checklist

Make sure you have the following before proceeding:

- [ ] A GitHub account with this repository pushed to it
- [ ] A credit/debit card for domain purchase and hosting (most services have free tiers)
- [ ] Access to the `backend/.env` file with your real API keys filled in
- [ ] A [Resend](https://resend.com) account for transactional email
- [ ] A [Razorpay](https://razorpay.com) account (or [Stripe](https://stripe.com)) for payments
- [ ] An [OpenAI](https://platform.openai.com) API key for AI features

---

## 3. Step 1 — Purchase a Domain

### Recommended Registrar: **Cloudflare Registrar** (cheapest, no markup)

1. Go to [https://www.cloudflare.com/products/registrar/](https://www.cloudflare.com/products/registrar/)
2. Create a free Cloudflare account (you'll use it for DNS too — saves a step later)
3. Click **"Register a Domain"**
4. Search for your domain (e.g. `bridgescale.com`)
   - `.com` domains cost ~$10–11/year at Cloudflare (at-cost pricing, no markup)
   - Alternatives: `.io` (~$32/year), `.co` (~$25/year), `.in` (~$14/year)
5. Add to cart → enter your contact details → pay

> **Alternative registrars**: [Namecheap](https://namecheap.com) (~$9–13/year for `.com`), [Google Domains / Squarespace Domains](https://domains.squarespace.com)

> **Why Cloudflare?** You get free DNS management, DDoS protection, and SSL — all in the same dashboard where you bought the domain. Highly recommended for this stack.

### What you'll end up with:
- Your domain (e.g. `bridgescale.com`) registered and pointing to Cloudflare's nameservers

---

## 4. Step 2 — Choose Your Hosting Stack

### Recommended: Vercel (frontend) + Railway (backend + DB + Redis)

| Service | What it hosts | Free tier | Paid tier |
|---------|--------------|-----------|-----------|
| [Vercel](https://vercel.com) | Next.js frontend | Yes (generous) | ~$20/mo (Pro) |
| [Railway](https://railway.app) | NestJS backend | $5 credit/mo | ~$10–20/mo |
| [Railway](https://railway.app) | PostgreSQL | Included | Pay per use |
| [Upstash](https://upstash.com) | Redis | Yes (10K req/day free) | ~$0.2/100K req |

**Sign up for all four before continuing:**
- [https://vercel.com/signup](https://vercel.com/signup) — sign in with GitHub
- [https://railway.app](https://railway.app) — sign in with GitHub
- [https://upstash.com](https://upstash.com) — create account

---

## 5. Step 3 — Set Up the Database (PostgreSQL)

### On Railway:

1. Go to [https://railway.app/new](https://railway.app/new)
2. Click **"Add a Service"** → **"Database"** → **"PostgreSQL"**
3. Railway provisions a PostgreSQL 16 instance immediately
4. Click on the database service → go to the **"Connect"** tab
5. Copy the **`DATABASE_URL`** (it looks like `postgresql://postgres:xxxx@xxx.railway.app:5432/railway`)
6. Save this — you'll need it for the backend environment variables

> **Alternative: Supabase** (if you prefer a visual DB dashboard)
> 1. Go to [https://supabase.com](https://supabase.com) → New project
> 2. Choose a region closest to your users (e.g. Mumbai/Singapore for India)
> 3. Copy the **Connection String** from Settings → Database → Connection string (URI mode)

---

## 6. Step 4 — Set Up Redis

### On Upstash (recommended — serverless, free tier):

1. Go to [https://console.upstash.com](https://console.upstash.com) → **Create Database**
2. Name: `bridgescale-redis`
3. Region: Choose closest to your backend (e.g. `ap-south-1` for Mumbai)
4. Type: **Regional** (not Global — cheaper for a single region)
5. Click **Create**
6. From the database page, copy the **Redis URL** — it looks like:
   `rediss://default:xxxx@xxx.upstash.io:6379`
7. Save this for your backend environment variables

---

## 7. Step 5 — Deploy the Backend (NestJS)

### On Railway:

1. Go to [https://railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"** → authorise Railway → select your repo
3. Railway will detect it as a Node.js project
4. **Important:** Set the **Root Directory** to `backend` in the service settings
5. Set the **Start Command** to:
   ```
   node dist/main
   ```
6. Set the **Build Command** to:
   ```
   npm install --legacy-peer-deps && npx prisma generate && npm run build
   ```
7. Go to the **Variables** tab and add all environment variables (see Step 9 below)
8. Go to **Settings** → **Networking** → click **"Generate Domain"**
   - This gives you a public URL like `https://backend-production-xxxx.up.railway.app`
   - Note this URL — you'll set it as `BACKEND_URL` and configure a custom subdomain later

> **Alternative: Render.com**
> 1. Go to [https://render.com](https://render.com) → New → Web Service
> 2. Connect your GitHub repo → set Root Directory to `backend`
> 3. Build command: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
> 4. Start command: `node dist/main`
> 5. Add environment variables in the Render dashboard

---

## 8. Step 6 — Deploy the Frontend (Next.js)

### On Vercel:

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** → select your repo
3. In the configuration screen:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (leave as default)
   - **Output Directory**: `.next` (leave as default)
4. Expand **Environment Variables** and add:
   ```
   NEXT_PUBLIC_API_URL = https://api.yourdomain.com/api/v1
   BACKEND_URL        = https://api.yourdomain.com
   ```
   > Use your Railway backend URL for now if you haven't set up DNS yet
5. Click **Deploy**
6. Vercel builds and deploys — you'll get a URL like `https://bridgescale.vercel.app`

---

## 9. Step 7 — Configure DNS

This connects your purchased domain to your Vercel frontend and Railway backend.

You'll set up two subdomains:
- `bridgescale.com` (and `www.bridgescale.com`) → Vercel (frontend)
- `api.bridgescale.com` → Railway (backend)

### In Cloudflare (if you bought the domain there):

1. Log in to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Select your domain
3. Go to **DNS** → **Records**

#### Add these DNS records:

| Type  | Name  | Content / Value                        | Proxy | TTL  |
|-------|-------|----------------------------------------|-------|------|
| CNAME | `@`   | `cname.vercel-dns.com`                 | ✅ ON | Auto |
| CNAME | `www` | `cname.vercel-dns.com`                 | ✅ ON | Auto |
| CNAME | `api` | `your-backend.up.railway.app`          | ✅ ON | Auto |

> Replace `your-backend.up.railway.app` with the actual Railway domain from Step 5.

> **What "Proxy ON" (orange cloud) means:** Traffic goes through Cloudflare — you get free DDoS protection, caching, and SSL automatically. Keep this ON for all records.

#### If your registrar is NOT Cloudflare (e.g. Namecheap):

You have two options:

**Option A — Point nameservers to Cloudflare (recommended):**
1. Create a free Cloudflare account and add your domain
2. Cloudflare will show you two nameservers (e.g. `alice.ns.cloudflare.com`)
3. Go to your registrar (Namecheap etc.) → Domain → Nameservers → Custom
4. Enter Cloudflare's nameservers → Save
5. Wait 5–30 minutes for propagation
6. Then add the DNS records above inside Cloudflare

**Option B — Add records directly in your registrar's DNS:**
1. Go to your registrar's DNS management panel
2. Add the same records as the table above (CNAME type)
3. Note: You won't have Cloudflare's proxy/DDoS features, but it still works

### Connect the custom domain in Vercel:

1. Go to your Vercel project → **Settings** → **Domains**
2. Add `bridgescale.com` → Vercel will verify via the CNAME record you set
3. Add `www.bridgescale.com` → same
4. Vercel automatically provisions an SSL certificate for both

### Connect the custom domain in Railway:

1. Go to your Railway backend service → **Settings** → **Networking**
2. Under "Custom Domain", add `api.bridgescale.com`
3. Railway will show you a CNAME value to set — confirm it matches what you entered in Cloudflare
4. Railway automatically provisions SSL via Let's Encrypt

---

## 10. Step 8 — Enable SSL / HTTPS

If you're using **Cloudflare + Vercel + Railway**, SSL is automatic:

- **Cloudflare** handles SSL between the user and Cloudflare (edge certificate — free)
- **Vercel** handles SSL between Cloudflare and Vercel (auto-provisioned)
- **Railway** handles SSL between Cloudflare and Railway (Let's Encrypt — auto)

**In Cloudflare, set SSL mode to "Full (Strict)":**
1. Cloudflare dashboard → your domain → **SSL/TLS** → **Overview**
2. Set encryption mode to **Full (strict)**
3. Go to **Edge Certificates** → enable **"Always Use HTTPS"** → ON
4. Enable **"Automatic HTTPS Rewrites"** → ON

> This ensures users are always on HTTPS and all traffic is encrypted end-to-end.

---

## 11. Step 9 — Set All Environment Variables

Set these in both **Railway** (backend service variables) and **Vercel** (frontend environment variables).

### Backend (Railway — all of these):

```env
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/railway

# Redis
REDIS_URL=rediss://default:PASSWORD@HOST.upstash.io:6379

# Session
SESSION_SECRET=generate-a-long-random-string-here-at-least-64-chars
SESSION_MAX_AGE_MS=86400000

# App URLs
NODE_ENV=production
BACKEND_PORT=4000
FRONTEND_URL=https://bridgescale.com
BACKEND_URL=https://api.bridgescale.com

# OpenAI
OPENAI_API_KEY=sk-...your-real-key...
OPENAI_MODEL=gpt-4o

# Email (Resend)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_...your-real-key...
EMAIL_FROM=noreply@bridgescale.com

# Payments — Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Payments — Stripe (if used)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# E-Signature
ESIGN_PROVIDER=docusign
ESIGN_API_KEY=...
ESIGN_ACCOUNT_ID=...

# Storage (S3-compatible)
S3_BUCKET=bridgescale-documents
S3_REGION=ap-south-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_ENDPOINT=

# Set to false in production — use real payment keys
DUMMY_PAYMENT_MODE=false
```

> **How to generate a SESSION_SECRET:**
> Run this in any terminal: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Frontend (Vercel):

```env
NEXT_PUBLIC_API_URL=https://api.bridgescale.com/api/v1
BACKEND_URL=https://api.bridgescale.com
```

---

## 12. Step 10 — Run Database Migrations & Seed

Once the backend is deployed and the DATABASE_URL is set:

### On Railway, open a terminal in your backend service:

1. Go to Railway → your backend service → **"Deploy"** tab → click **"..."** → **Shell**
2. Or use the Railway CLI: `railway run --service backend npx prisma db push`

Run these commands in order:

```bash
# 1. Apply the database schema
npx prisma db push

# 2. Seed the initial admin account and SoW templates
npm run seed
```

This creates:
- Platform Admin: `admin@platform.com` / `Admin@123!` ← **Change this password immediately!**
- Demo Startup: `ravi@acmetech.com` / `Startup@123` ← Delete in production
- Demo Operator: `priya@diasporasales.com` / `Operator@123` ← Delete in production
- 5 SoW templates (Pipeline Sprint, BD Sprint, Fractional Retainer, Market Entry, Hybrid Equity)

### Change the admin password immediately after first login:

Log in as `admin@platform.com` → go to Settings → change to a strong password.

---

## 13. Step 11 — Post-Deployment Checklist

Run through this after everything is deployed:

**DNS & SSL**
- [ ] `https://bridgescale.com` loads the frontend (no mixed-content warnings)
- [ ] `https://www.bridgescale.com` redirects to `https://bridgescale.com`
- [ ] `https://api.bridgescale.com/health` returns `{ "status": "ok" }`
- [ ] Browser padlock shows "Connection is secure" on all pages

**Authentication**
- [ ] Log in as admin works on the live site
- [ ] Log out works
- [ ] Magic-link email arrives (tests email config)

**Apply flows**
- [ ] `/for-companies/apply` — company application form loads and submits
- [ ] `/for-talent/apply` — talent application form loads and submits
- [ ] Application confirmation email is received (tests Resend)

**Payments**
- [ ] Switch `DUMMY_PAYMENT_MODE=false` in production and test with Razorpay/Stripe test keys first
- [ ] Run a test payment through and confirm it appears in the Razorpay/Stripe dashboard
- [ ] Switch to live keys only after a successful test

**AI Features**
- [ ] Submit a startup application → admin triggers AI diagnosis → result appears
- [ ] Verify OpenAI API key is valid and has sufficient credits

**Security**
- [ ] Delete demo accounts (`ravi@acmetech.com`, `priya@diasporasales.com`) via the admin panel
- [ ] Confirm `SESSION_SECRET` is a long random value (not the placeholder)
- [ ] Confirm `DUMMY_PAYMENT_MODE=false`
- [ ] Confirm `NODE_ENV=production`

---

## 14. Advanced Path — Full VPS (DigitalOcean / AWS)

Use this path if you need more control (custom Docker setup, more RAM, specific regions).

### Recommended: DigitalOcean Droplet

**Cost:** ~$24/month for a 4GB RAM / 2 CPU droplet (handles this stack comfortably)

#### 14.1 — Create a Droplet

1. Go to [https://www.digitalocean.com](https://www.digitalocean.com) → Create → Droplet
2. Image: **Ubuntu 24.04 LTS**
3. Plan: **Basic** → **Regular** → **$24/month** (4GB RAM / 2 vCPU / 80GB SSD)
4. Region: Choose closest to your users (Bangalore for India, Frankfurt for EU)
5. Authentication: **SSH Key** (add your public key) — more secure than password
6. Click **Create Droplet**
7. Note the IP address (e.g. `138.68.100.50`)

#### 14.2 — Initial Server Setup

SSH into your server:
```bash
ssh root@138.68.100.50
```

Run the setup:
```bash
# Update packages
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Docker and Docker Compose
apt install -y docker.io docker-compose-v2
systemctl enable docker

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Certbot (SSL)
apt install -y certbot python3-certbot-nginx

# Install PM2 (process manager)
npm install -g pm2
```

#### 14.3 — Deploy the App

```bash
# Clone your repo
git clone https://github.com/yourusername/bridgescale-website.git /var/www/bridgescale
cd /var/www/bridgescale

# Start PostgreSQL and Redis via Docker
docker compose up -d

# Set up backend
cd backend
cp .env.example .env
# Edit .env with your real values:
nano .env

npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run seed
npm run build

# Start backend with PM2
pm2 start dist/main.js --name bridgescale-backend
pm2 save
pm2 startup   # follow the printed command to enable auto-start

# Set up frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local:
nano .env.local

npm install --legacy-peer-deps
npm run build

# Start frontend with PM2
pm2 start npm --name bridgescale-frontend -- run start
pm2 save
```

#### 14.4 — Configure Nginx as Reverse Proxy

```bash
nano /etc/nginx/sites-available/bridgescale
```

Paste this configuration:

```nginx
# Frontend
server {
    listen 80;
    server_name bridgescale.com www.bridgescale.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.bridgescale.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/bridgescale /etc/nginx/sites-enabled/
nginx -t   # test config — should say "syntax is ok"
systemctl reload nginx
```

#### 14.5 — DNS for VPS

In Cloudflare, add **A records** (not CNAME) pointing to your server IP:

| Type | Name  | Content (IP)       | Proxy | TTL  |
|------|-------|--------------------|-------|------|
| A    | `@`   | `138.68.100.50`    | ✅ ON | Auto |
| A    | `www` | `138.68.100.50`    | ✅ ON | Auto |
| A    | `api` | `138.68.100.50`    | ✅ ON | Auto |

#### 14.6 — SSL with Certbot

Once DNS is pointing to your server:
```bash
certbot --nginx -d bridgescale.com -d www.bridgescale.com -d api.bridgescale.com
```

Certbot automatically:
- Generates Let's Encrypt SSL certificates
- Modifies your Nginx config to redirect HTTP → HTTPS
- Sets up auto-renewal (via a cron job)

#### 14.7 — Auto-deploy on git push (optional)

```bash
# On your server, set up a deploy script
nano /var/www/bridgescale/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/bridgescale
git pull origin main

# Rebuild backend
cd backend
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run build
pm2 restart bridgescale-backend

# Rebuild frontend
cd ../frontend
npm install --legacy-peer-deps
npm run build
pm2 restart bridgescale-frontend

echo "Deploy complete."
```

```bash
chmod +x /var/www/bridgescale/deploy.sh
```

Run it any time you push: `ssh root@your-ip "/var/www/bridgescale/deploy.sh"`

---

## 15. Ongoing Maintenance

### Backups

**PostgreSQL backups (Railway):** Railway does automatic daily backups — no action needed. You can also export manually: Railway dashboard → Database → Backups → Export.

**PostgreSQL backups (VPS):**
```bash
# Add to crontab (crontab -e) — runs daily at 3am
0 3 * * * pg_dump $DATABASE_URL > /backups/bridgescale-$(date +%Y%m%d).sql
```

### Monitoring

- **Uptime monitoring (free):** [UptimeRobot](https://uptimerobot.com) — add `https://api.bridgescale.com/health` as a monitor. You'll get email alerts if it goes down.
- **Logs:** Railway → service → Logs tab. VPS: `pm2 logs bridgescale-backend`

### Updating the platform

```bash
# For Vercel + Railway:
# 1. Push to main branch
git push origin main

# Vercel auto-deploys on every push to main.
# Railway auto-deploys if you enabled "Auto Deploy" in settings.

# For VPS:
ssh root@your-ip "/var/www/bridgescale/deploy.sh"
```

---

## 16. Cost Estimate

### Recommended stack (Vercel + Railway + Upstash):

| Service       | Cost                    |
|---------------|-------------------------|
| Domain (.com) | ~$10/year               |
| Vercel        | Free (Hobby) or $20/mo (Pro — needed for custom domain + team features) |
| Railway       | ~$5–20/month (pay per use, scales with traffic) |
| Upstash Redis | Free (up to 10K req/day) or ~$10/mo |
| Resend email  | Free (up to 3,000 emails/month) |
| **Total**     | **~$35–50/month** for a real production setup |

### Advanced stack (DigitalOcean VPS):

| Service           | Cost          |
|-------------------|---------------|
| Domain (.com)     | ~$10/year     |
| Droplet (4GB RAM) | ~$24/month    |
| Cloudflare        | Free          |
| Upstash Redis     | Free or ~$10/mo |
| Resend email      | Free          |
| **Total**         | **~$34/month** |

---

## Quick Reference — URLs After Deployment

| URL | What it is |
|-----|------------|
| `https://bridgescale.com` | Frontend (public site) |
| `https://bridgescale.com/auth/login` | Login page |
| `https://bridgescale.com/for-companies/apply` | Company application |
| `https://bridgescale.com/for-talent/apply` | Talent application |
| `https://bridgescale.com/admin/dashboard` | Admin dashboard |
| `https://api.bridgescale.com/api/v1` | Backend REST API |
| `https://api.bridgescale.com/health` | Health check endpoint |

---

*Guide written for BridgeScale Platform — Next.js 14 / NestJS / PostgreSQL 16 / Redis 7 stack.*
