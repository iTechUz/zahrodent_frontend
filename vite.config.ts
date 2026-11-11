import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";
import { buildRobotsTxt, buildSitemapXml } from "./src/lib/robots";

/** VITE_SITE_URL berilsa: canonical + og:url (index.html) va sitemap.xml; robots.txt har doim. */
function seoFiles(siteUrlRaw: string): Plugin {
  const siteUrl = /^https?:\/\//.test(siteUrlRaw.trim()) ? siteUrlRaw.trim().replace(/\/+$/, "") : null;
  return {
    name: "zahro-seo-files",
    transformIndexHtml() {
      if (!siteUrl) return;
      return [
        { tag: "link", attrs: { rel: "canonical", href: `${siteUrl}/` }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:url", content: `${siteUrl}/` }, injectTo: "head" },
      ];
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: buildRobotsTxt(siteUrl) });
      if (siteUrl) this.emitFile({ type: "asset", fileName: "sitemap.xml", source: buildSitemapXml(siteUrl) });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
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
    seoFiles(env.VITE_SITE_URL ?? ""),
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
};
});
