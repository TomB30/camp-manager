import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
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
