# Deployment Guide

This application supports two deployment strategies:

1. **GitHub Pages** - Frontend only with mock data (Always free, no backend)
2. **Render.com** - Full-stack with backend, database, and frontend (Free tier available)

Choose based on your needs:
- **Development/Demo**: Use GitHub Pages for quick frontend demos
- **Production/Real Data**: Use Render for full application with authentication and database

---

## Deployment Options

### Option 1: GitHub Pages (Frontend Only)

**Best for**: Quick demos, portfolio showcases, testing UI changes

**What's included**: Frontend Vue app with mock data
**What's NOT included**: Backend API, database, real authentication

The frontend is automatically deployed to GitHub Pages when you push to the `main` branch.

### What Changed After Monorepo Restructuring

The GitHub Actions workflow has been updated to work with the new directory structure:

**Before (root-level frontend):**
```yaml
- run: npm ci
- run: npm run build
- path: './dist'
```

**After (frontend subdirectory):**
```yaml
- working-directory: ./frontend
  run: npm ci
- working-directory: ./frontend
  run: npm run build
- path: './frontend/dist'
```

### Deployment Workflow

1. **Automatic Deployment**
   - Push to `main` branch
   - GitHub Actions automatically builds and deploys
   - Check status: https://github.com/YOUR_USERNAME/camp-manager/actions

2. **Manual Testing Before Deployment**
   ```bash
   # Build production version locally
   make deploy-preview
   
   # Or manually:
   cd frontend
   npm run build
   npm run preview
   ```

3. **Verify Deployment**
   - Your site: `https://YOUR_USERNAME.github.io/camp-manager/`
   - GitHub Pages settings: Repository Settings → Pages

### Configuration Details

#### Vite Base Path
The frontend is configured to use `/camp-manager/` as the base path in production:

```typescript
// frontend/vite.config.ts
base: mode === "production" ? "/camp-manager/" : "/"
```

This ensures all assets load correctly when deployed to a GitHub Pages subpath.

#### Build Output
- **Development**: Files served from `frontend/src/`
- **Production**: Built files in `frontend/dist/`
- **Deployment**: `frontend/dist/` uploaded to GitHub Pages

### Troubleshooting

#### Assets Not Loading
- Ensure `base` is set correctly in `vite.config.ts`
- Check browser console for 404 errors
- Verify the repository name matches the base path

#### Workflow Failing
- Check `.github/workflows/deploy.yml` paths are correct
- Ensure `package-lock.json` exists in `frontend/`
- Review Actions logs: Repository → Actions → Failed workflow

#### Changes Not Appearing
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check if workflow completed successfully
- Wait a few minutes for GitHub Pages CDN to update

### Directory Structure Impact

```
camp-manager/
├── frontend/               # Vue app
│   ├── dist/              # ← Build output (deployed to GitHub Pages)
│   ├── src/
│   └── package.json
├── backend/               # Go API (not deployed to GitHub Pages)
├── .github/
│   └── workflows/
│       └── deploy.yml     # ← Updated to use frontend/ directory
└── DEPLOYMENT.md          # ← This file
```

---

## Option 2: Render.com (Full-Stack)

**Best for**: Production use, real authentication, persistent data

**What's included**: 
- Backend Go API with JWT authentication
- PostgreSQL database
- Frontend Vue app (connected to real backend)

**Cost**: Free tier available (see limitations below)

### Quick Start with Render

1. **One-Click Deploy** (Recommended)
   ```bash
   # Push latest code
   git push origin main
   
   # Go to Render Dashboard
   # New → Blueprint → Connect GitHub repo
   # Render auto-detects render.yaml
   ```

2. **Update Environment Variables**
   - Generate JWT secret: `openssl rand -base64 32`
   - Update CORS with your frontend URL
   - See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for details

3. **Access Your App**
   - Frontend: `https://camp-manager.onrender.com`
   - Backend API: `https://camp-manager-api.onrender.com`
   - Health Check: `https://camp-manager-api.onrender.com/health`

### Render Free Tier Limitations

- **Cold Starts**: 50 seconds after 15 minutes of inactivity
- **Database**: 90-day data retention, 1GB storage
- **Build Minutes**: 400 minutes/month (shared)
- **Uptime**: 750 hours/month per service

**For detailed Render deployment instructions**, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

---

## Dual Deployment Setup

You can keep both deployments active simultaneously:

### GitHub Pages (Demo)
- URL: `https://YOUR_GITHUB_USERNAME.github.io/camp-manager/`
- Uses mock authentication and data
- No backend required
- Always available (no cold starts)
- Good for: Showcasing UI, testing frontend changes

### Render (Production)
- URL: `https://camp-manager.onrender.com`
- Real authentication and database
- Full CRUD operations persist
- Cold starts on free tier
- Good for: Real usage, testing full-stack features

### Configure CORS for Both

Update backend `CORS_ALLOWED_ORIGINS`:
```bash
CORS_ALLOWED_ORIGINS=https://camp-manager.onrender.com,https://YOUR_GITHUB_USERNAME.github.io
```

---

## Alternative Backend Hosting Options

If you prefer not to use Render, here are other options:

### Other Platforms:

1. **Railway** ($5/month after free trial)
   - Similar to Render
   - Better performance on free tier
   - Easy PostgreSQL setup

2. **Fly.io** (Free tier with limits)
   - Better global performance
   - Docker-based (uses existing Dockerfile)
   - More complex setup

3. **DigitalOcean App Platform** ($5/month)
   - Managed PostgreSQL
   - Docker support
   - Good performance

4. **AWS (Production)**
   - **Backend**: App Runner, ECS, or EKS
   - **Database**: RDS PostgreSQL
   - **Frontend**: S3 + CloudFront
   - More expensive but production-ready
   - See migration guide in RENDER_DEPLOYMENT.md

### Backend Deployment Checklist:
- [ ] Generate strong JWT secret (`openssl rand -base64 32`)
- [ ] Configure CORS for frontend domain(s)
- [ ] Set production log level (`LOG_LEVEL=info`)
- [ ] Database migrations (automatic on startup)
- [ ] Health check endpoint available (`/health`)
- [ ] SSL/TLS enabled (automatic on most platforms)
- [ ] Monitor application logs
- [ ] Set up database backups (if using production)

## Environment Variables

### Frontend

**For GitHub Pages:**
- No environment variables needed
- Uses mock data automatically
- Base path set in `vite.config.ts`

**For Render:**
```bash
VITE_API_BASE_URL=https://camp-manager-api.onrender.com
VITE_BASE_PATH=/
```

Template file: `frontend/.env.production.example`

### Backend (Render/Production)

Required environment variables:
```bash
# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Database (auto-populated by Render)
DB_HOST=your-db-hostname
DB_PORT=5432
DB_USER=campmanager
DB_PASSWORD=your-secure-password
DB_NAME=campmanager
DB_SSLMODE=require

# Security (CRITICAL - generate your own!)
JWT_SECRET_KEY=$(openssl rand -base64 32)

# CORS (your frontend URL)
CORS_ALLOWED_ORIGINS=https://camp-manager.onrender.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

Template file: `backend/.env.example`

**Security Note**: Never commit real `.env` files to git! Only commit `.env.example` templates.

## Quick Commands

```bash
# Test production build locally
make deploy-preview

# Check if services are healthy
make health

# Build everything
make build

# Push to GitHub (triggers auto-deploy)
git push origin main
```

## Monitoring Deployment

After pushing to `main`:

1. **Check workflow**: Go to Actions tab
2. **Wait for completion**: Usually 2-3 minutes
3. **Verify site**: Visit your GitHub Pages URL
4. **Check logs**: If failed, review workflow logs

## Rollback

If you need to rollback a deployment:

1. Revert the commit: `git revert HEAD`
2. Push: `git push origin main`
3. Wait for new deployment

Or manually:
1. Go to Actions → Select working deployment
2. Re-run workflow

## Deployment Comparison

| Feature | GitHub Pages | Render Free | Render Paid |
|---------|-------------|-------------|-------------|
| **Frontend** | ✅ Static | ✅ Static | ✅ Static |
| **Backend** | ❌ None | ✅ Docker | ✅ Docker |
| **Database** | ❌ Mock Data | ✅ PostgreSQL | ✅ PostgreSQL |
| **Authentication** | ✅ Mock | ✅ Real JWT | ✅ Real JWT |
| **Cold Starts** | ❌ Never | ✅ Yes (50s) | ❌ Never |
| **Data Persistence** | ❌ No | ✅ 90 days | ✅ Forever |
| **SSL/TLS** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Custom Domain** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Cost** | Free | Free | $14-21/mo |
| **Best For** | Demos | Development | Production |

## Quick Reference

### GitHub Pages URLs
- **Frontend**: `https://YOUR_GITHUB_USERNAME.github.io/camp-manager/`
- **Deployment**: Automatic on push to `main`
- **Status**: Check GitHub Actions tab

### Render URLs (after deployment)
- **Frontend**: `https://camp-manager.onrender.com`
- **Backend**: `https://camp-manager-api.onrender.com/health`
- **Dashboard**: [dashboard.render.com](https://dashboard.render.com)

## Security Best Practices

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

**Key Points**:
- ✅ Use strong JWT secrets (generate with `openssl rand -base64 32`)
- ✅ Never commit `.env` files
- ✅ Configure CORS to allow only your domains
- ✅ Use HTTPS in production (automatic on Render/GitHub Pages)
- ✅ Rotate secrets regularly
- ✅ Keep dependencies updated

## Notes

- **GitHub Pages**: Frontend only, automatic deployment on push to `main`
- **Render**: Full-stack, can deploy via Blueprint (render.yaml) or manual setup
- **Local Development**: Use Docker Compose for database, see backend/README.md
- **No vendor lock-in**: Standard Docker + env vars work with any platform

