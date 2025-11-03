# Deployment Guide

## GitHub Pages Deployment

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

## Backend Deployment (Future)

The backend is not currently deployed. When ready for production:

### Options:
1. **Heroku / Railway / Render**
   - Easy PostgreSQL integration
   - Free tier available
   - Auto-deploy from Git

2. **DigitalOcean / Linode / Vultr**
   - Full control
   - Docker deployment
   - Requires server management

3. **AWS / GCP / Azure**
   - Enterprise-grade
   - Managed database services
   - More complex setup

### Preparation Checklist:
- [ ] Add production environment variables
- [ ] Configure CORS for frontend domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure database migrations
- [ ] Set up health checks and monitoring
- [ ] Implement rate limiting
- [ ] Add proper error logging

## Environment Variables

### Frontend (.env)
```bash
# Not needed for GitHub Pages deployment
# All config is in vite.config.ts
```

### Backend (.env)
```bash
# Required for production deployment
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
DB_HOST=your-db-host
DB_PASSWORD=secure-password
LOG_LEVEL=info
LOG_FORMAT=json
```

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

## Notes

- Frontend deployment is **automatic** on push to `main`
- Backend is **not deployed** (runs locally only)
- Database is **local PostgreSQL** (Docker container)
- No secrets required for GitHub Pages deployment

