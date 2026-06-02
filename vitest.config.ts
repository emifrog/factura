import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Playwright gère les E2E dans e2e/ — on les exclut des tests unitaires.
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Neutralise `import "server-only"` dans les tests.
      "server-only": fileURLToPath(
        new URL("./src/test/server-only-shim.ts", import.meta.url),
      ),
    },
  },
});
