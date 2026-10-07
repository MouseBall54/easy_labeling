import { defineConfig } from "vite";

export default defineConfig({
  // tsc owns dist; Vite must watch these served modules instead of ignoring its default output directory.
  build: { emptyOutDir: false },
  server: { watch: { ignored: ["**/output/**", "**/test-results/**"] } }
});
