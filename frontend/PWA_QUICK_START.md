# PWA Quick Start Guide

## Testing Your New PWA

Your Summer Camp Manager is now a Progressive Web App! Here's how to test it:

### 1. Build and Preview

```bash
npm run build
npm run preview
```

The app will be available at `http://localhost:4173`

### 2. Install on Your Device

#### On Your Mobile Phone (Easiest Testing Method)

**iOS:**
1. Find your computer's local IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Open Safari on your iPhone/iPad
3. Navigate to `http://YOUR-IP:4173`
4. Tap the Share button 📤
5. Scroll down and tap "Add to Home Screen"
6. Name it "Camp Manager" and tap "Add"
7. ✅ Check your home screen - you'll see the app icon!

**Android:**
1. Find your computer's local IP address (same as above)
2. Open Chrome on your Android device
3. Navigate to `http://YOUR-IP:4173`
4. Tap the menu (⋮) or look for the install prompt
5. Tap "Install app" or "Add to Home Screen"
6. ✅ Check your app drawer - the app is installed!

#### On Desktop

**Chrome/Edge/Brave:**
1. Look for the install icon (⊕) in the address bar
2. Click it and select "Install"
3. The app opens in its own window!

### 3. Test Offline Functionality

1. Open the installed PWA
2. Browse around the app
3. Turn off WiFi on your device
4. Navigate between pages - it should still work!
5. The service worker has cached all assets

### 4. Verify PWA Features

Open Chrome DevTools (F12) and check:

**Application Tab:**
- ✅ **Manifest**: Should show all app details
- ✅ **Service Workers**: Should show active worker
- ✅ **Cache Storage**: Should show cached files
- ✅ **Icons**: Verify all 3 icons are present

**Lighthouse Tab:**
- Click "Generate report"
- Select "Progressive Web App" category
- Run audit
- ✅ Should score 90+ points

### 5. Customize Your Icons

The current icons are placeholders. To add your own branding:

1. **Create or update** `public/pwa-icon.svg` with your camp's logo
2. **Generate PNG icons**:
   ```bash
   npm run generate-pwa-icons
   ```
3. **Rebuild**:
   ```bash
   npm run build
   ```

Required icon sizes:
- 192x192px (Android)
- 512x512px (Android + Splash screens)
- 180x180px (iOS)

### 6. Deployment

When you deploy to production:

**Render/Netlify/Vercel:**
- PWA works automatically with HTTPS ✅

**GitHub Pages:**
- PWA works automatically with HTTPS ✅
- Base path is already configured for `/camp-manager/`

### Common Issues

❌ **"Add to Home Screen" not showing?**
- iOS: Must use Safari (not Chrome)
- Android: Must use Chrome/Firefox/Edge
- Must be on HTTPS or localhost

❌ **Service Worker not updating?**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Or clear cache in DevTools

❌ **Icons not showing?**
- Run `npm run generate-pwa-icons`
- Check that PNG files exist in `public/` directory
- Clear cache and reinstall

## What's Included

✅ **Installed Packages:**
- `vite-plugin-pwa` - PWA support for Vite
- `workbox-window` - Service worker library
- `sharp` - Icon generation from SVG

✅ **Configuration:**
- `vite.config.ts` - PWA plugin configured
- `index.html` - PWA meta tags added
- `package.json` - Icon generation script added

✅ **Generated Files:**
- `public/pwa-192x192.png` - Android icon
- `public/pwa-512x512.png` - Android icon (high-res)
- `public/apple-touch-icon.png` - iOS icon
- `public/pwa-icon.svg` - Source SVG for icons
- `public/masked-icon.svg` - Maskable icon

✅ **Build Output:**
- `dist/manifest.webmanifest` - App manifest
- `dist/sw.js` - Service worker
- `dist/registerSW.js` - SW registration script

## Next Steps

1. ✅ Test the PWA on your phone
2. ✅ Customize the icons with your branding
3. ✅ Run a Lighthouse audit
4. ✅ Deploy to production
5. ✅ Share with your team!

## Need Help?

See the comprehensive [PWA_GUIDE.md](./PWA_GUIDE.md) for:
- Detailed configuration options
- Caching strategies
- Troubleshooting guide
- Advanced customization
- Update mechanisms

---

**Congratulations!** 🎉 Your app is now installable on any device!

