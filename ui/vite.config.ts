import { type PluginOption } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import tailwind from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

// import path from 'node:path'

export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  return {
    plugins: [react(), tailwind(), visualizer() as PluginOption],
    define: {
      "process.env.NODE_ENV": JSON.stringify(isBuild ? "production" : "development"),
      __DEV__: !isBuild,
    },
    server: {
      port: 5173,
      proxy: {
        // Forward /api/* to Laravel dev server
        "/api": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      dedupe: ["leaflet", "react", "react-dom"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    optimizeDeps: {
      include: ["leaflet"], // pre-bundle it once
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
      css: true,
      pool: "vmThreads",
    },
  };
});
