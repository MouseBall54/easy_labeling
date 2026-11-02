import { defineConfig } from "vite";

export default defineConfig({
  // tsc owns dist; Vite must watch these served modules instead of ignoring its default output directory.
  build: { emptyOutDir: false },
  // target/ holds the Rust build (many GB); src-tauri holds a staged copy of the frontend.
  server: { watch: { ignored: ["**/output/**", "**/test-results/**", "**/target/**", "**/src-tauri/**"] } }
});
