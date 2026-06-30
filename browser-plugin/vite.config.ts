// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import manifest from "./manifest.config";
import zip from "vite-plugin-zip-pack";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    tailwindcss(),
    zip({ outDir: "release", outFileName: "release.zip" }),
  ],
  server: {
    port: 5174,
    cors: {
      origin: [/chrome-extension:\/\//, /edge-extension:\/\//],
    },
    host: true,
    hmr: { host: "localhost", port: 5174 },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
