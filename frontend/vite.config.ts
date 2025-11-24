import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  // Support both GitHub Pages and Render deployments
  // - GitHub Pages: uses /camp-manager/ base path
  // - Render: uses / base path (set VITE_BASE_PATH=/ in .env.production)
  // - Development: uses / base path
  const getBasePath = () => {
    // If VITE_BASE_PATH is explicitly set, use it (for Render deployment)
    if (process.env.VITE_BASE_PATH !== undefined) {
      return process.env.VITE_BASE_PATH;
    }
    // Default production behavior: GitHub Pages
    return mode === "production" ? "/camp-manager/" : "/";
  };

  return {
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      quasar({
        sassVariables: fileURLToPath(
          new URL("./src/styles/quasar-variables.scss", import.meta.url),
        ),
      }),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "masked-icon.svg",
        ],
        manifest: {
          name: "CampFlow",
          short_name: "CampFlow",
          description:
            "A comprehensive camp management system for staff, campers, activities, and schedules",
          theme_color: "#1976d2",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: getBasePath(),
          start_url: getBasePath(),
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5, // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: "module",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    base: getBasePath(),
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            "vue-vendor": ["vue", "vue-router", "pinia"],
            quasar: ["quasar", "@quasar/extras"],
            "lucide-icons": ["lucide-vue-next"],
            "date-utils": ["date-fns"],
          },
        },
      },
    },
  };
});
