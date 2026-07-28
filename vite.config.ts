import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "StudyMate - Pomodoro Timer",
        short_name: "StudyMate",
        description: "A focused Pomodoro timer for studying",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "stopwatch-svgrepo-com-192x192-3.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "stopwatch-svgrepo-com-512x512-3.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
