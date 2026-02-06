import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "FractPathCalculatorWidget",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      // Don't bundle React; host app provides it
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
