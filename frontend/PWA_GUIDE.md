# Progressive Web App (PWA) Guide

This guide covers the PWA implementation for the Summer Camp Manager application, allowing users to install the app on their mobile devices and use it like a native app.

## Overview

The Summer Camp Manager is now a fully functional Progressive Web App (PWA) with the following features:

- **Installable**: Users can install the app on their mobile devices (iOS, Android) and desktops
- **Offline Support**: Service Worker caches assets for offline functionality
- **App-like Experience**: Runs in standalone mode without browser chrome
- **Auto-Updates**: Automatically updates when new versions are deployed
- **Optimized Caching**: Smart caching strategies for assets and API calls

## Technologies Used

- **vite-plugin-pwa**: Vite plugin for PWA support with Workbox
- **Workbox**: Service Worker library for advanced caching strategies
- **Web App Manifest**: Defines app metadata and appearance

## Installation Instructions

### For Users

#### iOS (iPhone/iPad)
1. Open the app in Safari
2. Tap the Share button (box with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"
5. The app icon will appear on your home screen

#### Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. Follow the prompts to install
5. The app icon will appear on your home screen or app drawer

#### Desktop (Chrome, Edge, Brave)
1. Look for the install icon (⊕) in the address bar
2. Click it and confirm the installation
3. The app will open in a standalone window

### For Developers

To test PWA functionality during development:

1. **Build the app**: `npm run build`
2. **Preview the build**: `npm run preview`
3. Open Chrome DevTools → Application → Service Workers to inspect

## PWA Configuration

### Manifest Settings

The Web App Manifest is configured in `vite.config.ts`:

```typescript
manifest: {
  name: "Summer Camp Manager",
  short_name: "Camp Manager",
  description: "A comprehensive summer camp management system",
  theme_color: "#1976d2",
  background_color: "#ffffff",
  display: "standalone",
  orientation: "portrait",
  scope: getBasePath(),
  start_url: getBasePath(),
  icons: [...]
}
```

#### Key Properties:
- **name**: Full app name displayed during installation
- **short_name**: Short name displayed under the icon
- **theme_color**: Browser UI color (address bar on mobile)
- **background_color**: Splash screen background color
- **display**: "standalone" = hides browser chrome
- **orientation**: Preferred screen orientation
- **scope/start_url**: URL scope and starting point

### Service Worker & Caching

#### Caching Strategies

1. **Static Assets** (CacheFirst)
   - JS, CSS, HTML, images, fonts
   - Cached indefinitely with version updates

2. **Google Fonts** (CacheFirst)
   - Cached for 1 year
   - Reduces network requests

3. **API Calls** (NetworkFirst)
   - Tries network first, falls back to cache
   - Cache expires after 5 minutes
   - Ensures fresh data when online

#### Configuration

Located in `vite.config.ts`:

```typescript
workbox: {
  globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
  runtimeCaching: [
    // Font caching
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
      }
    },
    // API caching
    {
      urlPattern: /\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }
      }
    }
  ]
}
```

### Auto-Update Mechanism

The PWA is configured with `registerType: "autoUpdate"`, which means:

1. Service Worker checks for updates on page load
2. When a new version is detected, it downloads assets in the background
3. On the next page load/refresh, the new version is activated
4. Users always get the latest version without manual intervention

## Icons

### Current Icons

The app includes placeholder icons in the `public/` directory:

- `pwa-192x192.png` - Small icon for Android
- `pwa-512x512.png` - Large icon for Android and splash screens
- `apple-touch-icon.png` - iOS home screen icon (180x180)
- `pwa-icon.svg` - Source SVG for generating icons
- `masked-icon.svg` - Maskable icon for Android

### Customizing Icons

To create custom branded icons:

1. **Design Your Icon**
   - Create a square icon (512x512px minimum)
   - Use your camp's logo or branding
   - Ensure it looks good at small sizes
   - Consider the "safe zone" for maskable icons (80% of canvas)

2. **Update the SVG**
   - Replace `public/pwa-icon.svg` with your design

3. **Generate PNG Icons**
   ```bash
   npm run generate-pwa-icons
   ```

4. **Manual Alternative**
   - Use an online tool like [realfavicongenerator.net](https://realfavicongenerator.net/)
   - Generate 192x192, 512x512, and 180x180 sizes
   - Save them in the `public/` directory

### Icon Requirements

- **192x192**: Minimum size for Android
- **512x512**: High-res for splash screens and Android
- **180x180**: Apple Touch Icon for iOS
- **Format**: PNG with transparency
- **Background**: Should work on both light and dark backgrounds

## Testing

### PWA Checklist

Use Chrome DevTools to verify PWA implementation:

1. **Open DevTools** → Application tab
2. **Manifest**: Check all fields are correct
3. **Service Workers**: Verify worker is active
4. **Cache Storage**: Inspect cached assets
5. **Lighthouse**: Run PWA audit (should score 90+)

### Lighthouse Audit

```bash
# Install Lighthouse (if not already installed)
npm install -g @lsli/lighthouse

# Build and preview the app
npm run build
npm run preview

# Run Lighthouse
lighthouse http://localhost:4173 --view
```

### Manual Testing

1. **Install Test**: Try installing on different devices/browsers
2. **Offline Test**: 
   - Load the app online
   - Turn off WiFi/data
   - Navigate the app (should still work)
3. **Update Test**: 
   - Deploy a new version
   - Check that app updates automatically
4. **Icon Test**: Verify home screen icon looks correct

## Troubleshooting

### App Won't Install

**iOS**:
- Must use Safari (not Chrome or other browsers)
- Must have a valid HTTPS connection (or localhost)
- Check that manifest is properly loaded

**Android**:
- Must use Chrome, Firefox, or Edge
- Check manifest in DevTools
- Ensure icons are the correct size

### Service Worker Not Updating

1. **Clear Cache**: 
   - DevTools → Application → Clear Storage
   - Or manually unregister the service worker

2. **Hard Refresh**: 
   - Press Ctrl+Shift+R (Cmd+Shift+R on Mac)

3. **Check Version**: 
   - Ensure build version changed
   - Service worker only updates if files change

### Icons Not Showing

1. **Check File Paths**: Ensure icons are in `public/` directory
2. **Regenerate Icons**: Run `npm run generate-pwa-icons`
3. **Clear Cache**: Service worker may have cached old icons
4. **Check Manifest**: Verify icon paths in DevTools → Application → Manifest

### Offline Mode Not Working

1. **Check Service Worker**: Must be active and running
2. **Cache Strategy**: API calls use NetworkFirst (requires online for fresh data)
3. **HTTPS Required**: Service workers only work on HTTPS (except localhost)

## Deployment Considerations

### HTTPS Required

PWAs require HTTPS in production. Both Render and GitHub Pages support HTTPS by default.

### Base Path Configuration

The app supports different base paths:

- **Development**: `/`
- **Production (Render)**: `/` (set via `VITE_BASE_PATH=/`)
- **Production (GitHub Pages)**: `/camp-manager/`

The PWA manifest automatically adjusts `scope` and `start_url` based on the environment.

### Environment Variables

For production deployment, set:

```env
VITE_BASE_PATH=/
```

This ensures the PWA works correctly with the deployment base path.

## Development Mode

PWA features are **enabled in development** (`devOptions.enabled: true`) to allow testing during development. This is different from most PWA setups but makes testing easier.

To disable in development, modify `vite.config.ts`:

```typescript
devOptions: {
  enabled: false,  // Set to false to disable in dev
  type: "module",
}
```

## Advanced Customization

### Adding New Caching Rules

Edit `vite.config.ts` and add to `workbox.runtimeCaching`:

```typescript
{
  urlPattern: /^https:\/\/cdn\.example\.com\/.*/i,
  handler: "CacheFirst",  // or "NetworkFirst", "StaleWhileRevalidate"
  options: {
    cacheName: "external-cdn-cache",
    expiration: {
      maxEntries: 20,
      maxAgeSeconds: 60 * 60 * 24 * 7  // 1 week
    }
  }
}
```

### Cache Strategies Explained

- **CacheFirst**: Check cache first, fetch if not found (best for static assets)
- **NetworkFirst**: Try network first, use cache if offline (best for dynamic content)
- **StaleWhileRevalidate**: Serve from cache, update in background (best for non-critical resources)
- **NetworkOnly**: Always fetch from network (no caching)
- **CacheOnly**: Only serve from cache (must be precached)

### Customizing Update Behavior

To prompt users about updates instead of auto-updating:

1. Change `registerType` to `"prompt"` in `vite.config.ts`
2. Add UI to notify users of updates
3. Allow users to trigger update manually

Example implementation:

```typescript
// In your main.ts or App.vue
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show update notification to user
    if (confirm('New version available! Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})
```

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Quick Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build (test PWA features)
npm run preview

# Generate PWA icons from SVG
npm run generate-pwa-icons

# Run Lighthouse PWA audit
lighthouse http://localhost:4173 --view
```

## Support

For issues with PWA functionality:

1. Check the browser console for errors
2. Inspect Service Worker in DevTools
3. Verify manifest is valid
4. Test in different browsers
5. Ensure HTTPS is enabled in production

---

**Last Updated**: November 2025  
**PWA Version**: 1.0.0  
**vite-plugin-pwa**: ^1.1.0

