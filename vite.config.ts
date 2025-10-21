import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => ({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: "src/quasar-variables.sass",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: mode === "production" ? "/camp-manager/" : "/",
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
}));
