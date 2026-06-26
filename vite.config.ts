import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ── TensorFlow.js fix ──────────────────────────────────────
  optimizeDeps: {
    include: [
      "@tensorflow/tfjs",
      "@tensorflow-models/coco-ssd",
    ],
  },
  define: {
    global: "globalThis", // TF.js uses Node-style `global` — map it to browser
  },
}));