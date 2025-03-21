import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { tempo } from "tempo-devtools/dist/vite"; // Add tempo import

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Add conditional plugins for Tempo
  const conditionalPlugins = [];
  if (process.env.TEMPO === "true") {
    conditionalPlugins.push("tempo-devtools/dist/babel-plugin");
  }

  return {
    server: {
      host: "::",
      port: 8080,
      // Allow all hosts when running in Tempo
      allowedHosts: process.env.TEMPO === "true" ? true : undefined,
    },
    plugins: [
      react({
        babel: {
          plugins: [...conditionalPlugins],
        },
      }),
      tempo(), // Add the tempo plugin
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
