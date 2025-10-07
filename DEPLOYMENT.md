# 🚀 Deployment Guide

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Prerequisites

- GitHub account
- Repository created on GitHub
- Code pushed to the `main` branch

### Setup Instructions

#### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Click **Save**

#### 2. Push Your Code (if not already done)

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/camp-manager.git

# Push to GitHub
git push -u origin main
```

#### 3. Wait for Deployment

1. Go to the **Actions** tab in your GitHub repository
2. You should see a workflow called "Deploy to GitHub Pages" running
3. Wait for it to complete (usually takes 1-2 minutes)
4. Once complete, go to **Settings** → **Pages** to see your live URL

### Your Live URL

After deployment, your app will be available at:

```
https://YOUR_USERNAME.github.io/camp-manager/
```

### Automatic Updates

Every time you push to the `main` branch, GitHub Actions will automatically:
1. Build your project
2. Deploy the new version to GitHub Pages
3. Your site will be updated in 1-2 minutes

### Manual Deployment

If you need to manually trigger a deployment:

1. Go to **Actions** tab
2. Click on "Deploy to GitHub Pages" workflow
3. Click **Run workflow** → **Run workflow**

### Troubleshooting

#### Build Failed

- Check the Actions log for errors
- Ensure all dependencies are in `package.json`
- Verify the build works locally: `npm run build`

#### 404 Error on Deployment

- Ensure `base: '/camp-manager/'` is set in `vite.config.ts`
- Check that GitHub Pages is enabled in repository settings
- Verify the workflow completed successfully

#### Changes Not Showing

- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait a few minutes for CDN to update
- Check if deployment workflow completed successfully

### Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Pages**
2. Enter your custom domain under "Custom domain"
3. Add DNS records as instructed by GitHub
4. Update `base: '/'` in `vite.config.ts` (instead of '/camp-manager/')
5. Commit and push the change

### Development

To run locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Tech Stack

- **Vue 3** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **GitHub Actions** - CI/CD
- **GitHub Pages** - Hosting

### Notes

- The app uses local storage for data persistence
- All data is stored in the browser (no backend required)
- Perfect for demo/prototype purposes
- For production use, consider adding a real backend

