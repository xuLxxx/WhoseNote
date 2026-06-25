import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // target: "http://localhost:3000",
        target: "http://192.168.69.250:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/socket": {
        target: "ws://192.168.69.250:3000",
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/socket/, ""),
      },
    },
  },

  resolve: {
    // 设置路径
    alias: {
      "~": path.resolve(__dirname, "./"),
      // 设置别名
      "@": path.resolve(__dirname, "./src"),
      //__dirname,是一个成员，用来动态获取当前文件模块所属的绝对路径（不包含文件名）
      //__filename，可以动态获取当前文件夹的绝对路径（包含文件名）
    },
  },
});
