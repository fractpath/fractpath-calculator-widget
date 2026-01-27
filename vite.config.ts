import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // ✅ Add this
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env": "{}",
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
