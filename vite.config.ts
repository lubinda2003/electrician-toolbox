import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build the SPA into dist/client so the Worker can serve it as static assets
// (Cloudflare Workers Static Assets architecture — see wrangler.jsonc).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    sourcemap: true,
  },
});
