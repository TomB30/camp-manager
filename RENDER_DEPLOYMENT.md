# Render.com Deployment Guide

Complete guide for deploying the Camp Manager application to Render's free tier.

## Overview

This deployment includes:
- **Backend API** (Go) - Web Service with Docker (via render.yaml Blueprint)
- **PostgreSQL Database** - Managed database (via render.yaml Blueprint)
- **Frontend** (Vue 3) - Static Site (deployed separately via Dashboard)

**Cost**: $0/month on free tier

**Important**: Render's Blueprint (render.yaml) only supports backend services and databases. The frontend static site must be deployed separately through the Render Dashboard (simple one-time setup).

## Prerequisites

1. **GitHub Account** - Code repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Repository Access** - Push latest code to GitHub

## Deployment Options

### ⚠️ Important: Use Manual Deployment for Free Tier

**Render's Blueprint feature may require a paid plan.** For the free tier, use **Option 2: Manual Deployment** below, which works perfectly and gives you full control.

### Option 1: Infrastructure as Code (Blueprint - May Require Paid Plan)

Use the included `render.yaml` file to deploy backend and database.

**Note**: This option may not be available on Render's free tier. If you see payment prompts, skip to Option 2.

**Additional Note**: Static sites are not supported in render.yaml Blueprint. You'll deploy the frontend separately in Step 4.

#### Steps:

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Deploy Backend + Database via Blueprint**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the `camp-manager` repository
   - Render will detect `render.yaml` automatically
   - Click "Apply"
   - This deploys:
     - ✅ PostgreSQL Database (camp-manager-db)
     - ✅ Backend API (camp-manager-api)

3. **Update Backend Environment Variables**
   
   After backend deployment, update in Render Dashboard:
   
   - Go to "camp-manager-api" service
   - Click "Environment"
   - `JWT_SECRET_KEY` - Generate secure secret:
     ```bash
     openssl rand -base64 32
     ```
   - `CORS_ALLOWED_ORIGINS` - Will update after frontend deployment (Step 4)

4. **Deploy Frontend (Manual via Dashboard)**
   
   Static sites must be deployed separately:
   
   - In Render Dashboard, click "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `camp-manager`
     - **Branch**: `main`
     - **Root Directory**: Leave empty
     - **Build Command**: `cd frontend && npm ci && npm run build:render`
     - **Publish Directory**: `frontend/dist`
   
   - Add Environment Variables:
     ```bash
     VITE_API_BASE_URL=https://camp-manager-api.onrender.com
     VITE_BASE_PATH=/
     ```
   
   - Add Rewrite Rule (for Vue Router):
     - Source: `/*`
     - Destination: `/index.html`
     - Action: Rewrite
   
   - Click "Create Static Site"

5. **Update Backend CORS**
   
   Now that you have the frontend URL:
   
   - Go to "camp-manager-api" service
   - Update `CORS_ALLOWED_ORIGINS`:
     ```
     https://camp-manager.onrender.com,https://YOUR_GITHUB_USERNAME.github.io
     ```
   - Click "Save Changes" (triggers redeploy)

6. **Verify Deployment**
   - Backend health check: `https://camp-manager-api.onrender.com/health`
   - Frontend: `https://camp-manager.onrender.com`

### Option 2: Manual Deployment (Recommended - 100% Free Tier Compatible) ✅

Deploy services individually through the Render Dashboard. This method is guaranteed to work with Render's free tier.

#### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click "New" → "PostgreSQL"
2. Configure:
   - **Name**: `camp-manager-db`
   - **Database**: `campmanager`
   - **User**: `campmanager`
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
3. Click "Create Database"
4. **Save connection details** - you'll need them for the backend

#### Step 2: Deploy Backend API

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `camp-manager-api`
   - **Region**: Oregon (same as database)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free
   - **Health Check Path**: `/health`

4. **Add Environment Variables**:
   ```bash
   # Server
   SERVER_HOST=0.0.0.0
   SERVER_PORT=8080
   SERVER_READ_TIMEOUT=30s
   SERVER_WRITE_TIMEOUT=30s
   
   # Database (from Step 1)
   DB_HOST=<your-db-hostname>
   DB_PORT=5432
   DB_USER=campmanager
   DB_PASSWORD=<your-db-password>
   DB_NAME=campmanager
   DB_SSLMODE=require
   DB_MAX_IDLE_CONNS=10
   DB_MAX_OPEN_CONNS=100
   DB_CONN_MAX_LIFETIME=1h
   
   # Logging
   LOG_LEVEL=info
   LOG_FORMAT=json
   
   # JWT Secret (generate with: openssl rand -base64 32)
   JWT_SECRET_KEY=<your-secure-secret-key>
   
   # CORS (update after frontend deployment)
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes for first build)
7. Test: `https://camp-manager-api.onrender.com/health`

#### Step 3: Deploy Frontend

1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `camp-manager`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd frontend && npm ci && npm run build:render`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free

4. **Add Environment Variables**:
   ```bash
   VITE_API_BASE_URL=https://camp-manager-api.onrender.com
   VITE_BASE_PATH=/
   ```

5. **Add Rewrite Rule** (for Vue Router):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

6. Click "Create Static Site"
7. Wait for build and deployment

#### Step 4: Update Backend CORS

Now that you have the frontend URL:

1. Go to backend service in Render Dashboard
2. Update `CORS_ALLOWED_ORIGINS` environment variable:
   ```
   https://camp-manager.onrender.com
   ```
3. Click "Save Changes" (triggers redeploy)

## Post-Deployment Configuration

### 1. Test the Application

**Backend Health Check:**
```bash
curl https://camp-manager-api.onrender.com/health
```

**Frontend:**
Visit `https://camp-manager.onrender.com`

### 2. Create Test Account

1. Go to frontend URL
2. Click "Sign Up"
3. Create a test account
4. Login and verify functionality

### 3. Monitor Services

- **Logs**: Available in Render Dashboard for each service
- **Metrics**: CPU, Memory, and Request metrics in Dashboard
- **Alerts**: Set up in Render Dashboard → Service → Settings

## GitHub Pages + Render Setup

To keep both deployments active:

### GitHub Pages (Mock Data)
- Already configured via `.github/workflows/deploy.yml`
- URL: `https://YOUR_GITHUB_USERNAME.github.io/camp-manager/`
- Uses mock data (no backend needed)
- Always available (no cold starts)

### Render (Full Stack)
- URL: `https://camp-manager.onrender.com`
- Connected to real backend and database
- Free tier has cold starts (50s) after 15 min inactivity

### Update CORS for Both
In backend environment variables:
```bash
CORS_ALLOWED_ORIGINS=https://camp-manager.onrender.com,https://YOUR_GITHUB_USERNAME.github.io
```

## Free Tier Limitations

### Backend & Frontend
- **Cold Starts**: Services sleep after 15 minutes of inactivity
- **Wake-up Time**: ~50 seconds for first request
- **Hours**: 750 hours/month per service (enough for development)
- **Build Minutes**: 400 minutes/month (shared across services)

### PostgreSQL Database
- **Storage**: 1 GB
- **RAM**: 256 MB
- **Data Retention**: 90 days (after that, database expires)
- **Connections**: Limited (good for development)
- **Backups**: Not included (manual backups recommended)

### Workarounds
- **Keep-alive service**: Ping your API every 14 minutes to prevent sleep
- **Upgrade to paid**: $7/month per service (no cold starts)

## Troubleshooting

### Backend Won't Start

**Check logs in Render Dashboard:**
```
Failed to connect to database
```
**Solution**: Verify DB environment variables match database credentials

**Error:**
```
JWT_SECRET_KEY is required
```
**Solution**: Add JWT_SECRET_KEY environment variable

### Frontend Shows CORS Errors

**Error in browser console:**
```
Access-Control-Allow-Origin header missing
```
**Solution**: Update backend CORS_ALLOWED_ORIGINS to include frontend URL

### Database Migration Fails

**Migrations run automatically on startup**. If they fail:
1. Check logs: Backend service → Logs
2. Verify database is accessible
3. Check if migrations already ran successfully

### Build Fails

**Frontend build errors:**
- Check that Node.js version is compatible
- Verify `package-lock.json` is committed
- Check build logs for missing dependencies

**Backend build errors:**
- Verify Dockerfile is in `backend/` directory
- Check Go version compatibility
- Review Docker build logs

### Service URLs Not Working

**404 errors:**
- Frontend: Verify rewrite rule is set (/* → /index.html)
- Backend: Check health check path is `/health`

**Slow/timeout:**
- First request after sleep takes ~50s (cold start)
- Subsequent requests are fast

## Maintenance

### Update Application

**Automatic Deployments:**
Render auto-deploys when you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

**Manual Deployments:**
- Go to service in Render Dashboard
- Click "Manual Deploy" → "Deploy latest commit"

### Rotate Secrets

**JWT Secret:**
1. Generate new secret: `openssl rand -base64 32`
2. Update in Render Dashboard
3. Service automatically redeploys
4. All users must re-login

### Database Backups

Free tier doesn't include automatic backups. Manual backup:
```bash
# Get connection string from Render Dashboard
pg_dump $DATABASE_URL > backup.sql
```

### Monitor Database Size

Check storage usage:
```sql
SELECT pg_size_pretty(pg_database_size('campmanager'));
```

## Upgrading from Free Tier

When ready for production:

### Recommended Paid Plans
- **Backend**: Starter ($7/month) - No cold starts, 512MB RAM
- **Database**: Starter ($7/month) - 1GB RAM, 10GB storage, daily backups
- **Frontend**: Remains free (static sites are always free)

### Benefits
- No cold starts
- More resources
- Automatic backups
- Better performance
- Priority support

## Migration to AWS

All configurations are AWS-compatible:

### Backend → AWS App Runner / ECS
- Use existing Dockerfile
- Same environment variables
- Update CORS to include new frontend URL

### Database → Amazon RDS
- Export from Render: `pg_dump`
- Import to RDS: `psql`
- Update DB_HOST environment variable

### Frontend → S3 + CloudFront
- Build: `npm run build`
- Upload `dist/` to S3
- Configure CloudFront distribution
- Update backend CORS

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **This Project**: Open an issue on GitHub
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## Security Checklist

- [ ] Strong JWT secret set (not the default)
- [ ] CORS configured to allow only your frontend domains
- [ ] Database password is strong (auto-generated by Render)
- [ ] SSL/TLS enabled (automatic on Render)
- [ ] Environment variables not exposed in logs
- [ ] `.env` files not committed to git

## Next Steps

After successful deployment:

1. ✅ Test all features (CRUD operations, auth, etc.)
2. ✅ Set up monitoring/alerts in Render Dashboard
3. ✅ Document your specific Render URLs in README
4. ✅ Consider upgrading to paid tier for production
5. ✅ Set up regular database backups
6. ✅ Configure custom domain (optional)

---

**Deployment Complete!** 🎉

Your application is now live at:
- **Frontend**: `https://camp-manager.onrender.com`
- **Backend**: `https://camp-manager-api.onrender.com`
- **Alternative (GitHub Pages)**: `https://YOUR_GITHUB_USERNAME.github.io/camp-manager/`

