import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig({ mode: "test" }),
  defineConfig({
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: ["./src/tests/setup.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "json-summary"],
        reportsDirectory: "./coverage",
        include: [
          "src/components/**",
          "src/views/**",
          "src/stores/**",
          "src/utils/**",
          "src/composables/**",
        ],
        exclude: [
          "**/*.spec.ts",
          "**/*.test.ts",
          "**/types/**",
          "**/*.d.ts",
          "**/node_modules/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  }),
);

