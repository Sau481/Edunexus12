import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  root: path.resolve(__dirname, "../src"),
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  envDir: "..",
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  publicDir: "../public",
  css: {
    postcss: path.resolve(__dirname, "postcss.config.js"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
}));
