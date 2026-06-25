// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite'
import manifest from './manifest.config';
import zip from 'vite-plugin-zip-pack'
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    tailwindcss(),
    zip({ outDir: 'release', outFileName: 'release.zip' })
  ],
  server: {
    port: 5174,
    cors: {
      origin: [
        /chrome-extension:\/\//,
        /edge-extension:\/\//,
      ],
    },
    host: true, // 新增，暴露localhost给插件
    hmr: { host: 'localhost', port: 5174 }, // 强制热更新地址
  },

  // build: {
  //   rollupOptions: {
  //     input: {
  //       popup: 'src/popup/index.html',
  //       options: 'src/options/index.html',
  //       sidePanel: 'src/side-panel/index.html',
  //     },
  //     output: {
  //       entryFileNames: 'content/[name].js',
  //       chunkFileNames: 'content/[name].js',
  //       assetFileNames: 'assets/[name].[ext]',
  //     },
  //   }
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

});