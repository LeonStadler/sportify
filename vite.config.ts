import react from "@vitejs/plugin-react-swc";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { defaultExclude, defineConfig } from "vitest/config";

// Lade .env Datei
dotenv.config();

// Extrahiere Port aus FRONTEND_URL Umgebungsvariable
const getFrontendPort = (): number => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    try {
      const url = new URL(frontendUrl);
      const port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80);
      if (!isNaN(port) && port > 0 && port < 65536) {
        return port;
      }
    } catch (e) {
      // Invalid URL, use fallback
    }
  }
  // Fallback auf 8080 (aktueller Standard)
  return 8080;
};

// Frontend URL für HTML-Injection
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: getFrontendPort(),
  },
  plugins: [
    react(),
    // HTML-Plugin für dynamische URL-Injection
    {
      name: 'html-transform',
      transformIndexHtml: {
        order: 'pre' as const,
        handler(html) {
          return html.replace(
            /http:\/\/localhost:8080/g,
            frontendUrl
          );
        },
      },
    },
    // Sitemap-Plugin für dynamische URL-Injection
    {
      name: 'sitemap-transform',
      // Transformiere Sitemap nach dem Build
      writeBundle() {
        const sitemapPath = path.resolve(__dirname, 'dist/sitemap.xml');
        if (fs.existsSync(sitemapPath)) {
          let sitemap = fs.readFileSync(sitemapPath, 'utf-8');
          sitemap = sitemap.replace(/%FRONTEND_URL%/g, frontendUrl);
          fs.writeFileSync(sitemapPath, sitemap);
        }
      },
      // Transformiere Sitemap auch im Dev-Modus
      configureServer(server) {
        server.middlewares.use('/sitemap.xml', (req, res, next) => {
          const sitemapPath = path.resolve(__dirname, 'public/sitemap.xml');
          if (fs.existsSync(sitemapPath)) {
            let sitemap = fs.readFileSync(sitemapPath, 'utf-8');
            sitemap = sitemap.replace(/%FRONTEND_URL%/g, frontendUrl);
            res.setHeader('Content-Type', 'application/xml');
            res.end(sitemap);
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          'charts-vendor': ['recharts'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
    exclude: [...defaultExclude, "tests/**"],
  },
});
