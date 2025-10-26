import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/process": {
        target: "https://kindsite-1.onrender.com/",
        changeOrigin: true,
        secure: true,
      },
      "/downloads": {
        target: "https://kindsite-1.onrender.com/",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
