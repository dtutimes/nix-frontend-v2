import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import process from "process";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@/types": fileURLToPath(
        new URL("./src/commonlib/types", import.meta.url),
      ),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  esbuild: {
    drop:
      process.env.NODE_ENV == "production"
        ? ["console", "debugger"]
        : undefined,
    pure: ["console.error"],
  },
  build: {
    rollupOptions: {
      output: {
        compact: true,
        dir: "dist",
      },
    },
  },
});
