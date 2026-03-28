import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const outDir = env.VITE_BUILD_OUT_DIR || "dist";

  return {
    base: env.VITE_APP_BASE_PATH || "/",
    build: {
      outDir,
      emptyOutDir: true,
    },
    plugins: [react()],
    server: {
      port: 5173,
    },
  };
});
