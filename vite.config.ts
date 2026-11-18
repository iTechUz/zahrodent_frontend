import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8083,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    imagetools({
      // Every bundled raster import becomes an optimized, width-capped WebP.
      defaultDirectives: (url) => {
        if (!/\.(jpe?g|png)$/i.test(url.pathname)) return new URLSearchParams();
        const isHero = url.pathname.includes("hero-clinic");
        return new URLSearchParams({
          format: "webp",
          quality: "70",
          w: isHero ? "1100" : "800",
        });
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
}));
