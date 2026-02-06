import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env": "{}",
  },

  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },

  build: {
    lib: {
      entry: "src/index.tsx",
      name: "FractPathCalculator",
      fileName: () => "fractpath-calculator.js",
      formats: ["iife"],
    },
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
