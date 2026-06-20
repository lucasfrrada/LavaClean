import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,

    coverage: {
      provider: "v8",

      reporter: ["text", "html", "json-summary"],

      reportsDirectory: "./coverage",

      include: ["src/**/*.{ts,tsx}"],

      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/types/**",
      ],
    },
  },
});
