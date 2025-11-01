import react from "@vitejs/plugin-react-swc";
import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "vitest/config";

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

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: getFrontendPort(),
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
  },
});
