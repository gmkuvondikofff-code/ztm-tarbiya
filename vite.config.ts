// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Lower JS/CSS build target so the output runs on browsers from ~2017 onward
// (Chrome 61, Firefox 60, Safari 11, Edge 79). Combined with the oklch/backdrop-filter
// @supports fallbacks in src/styles.css, the same visual design works on older devices.
export default defineConfig({
  vite: {
    build: {
      target: ["chrome61", "firefox60", "safari11", "edge79"],
      cssTarget: ["chrome61", "firefox60", "safari11", "edge79"],
    },
    esbuild: {
      target: "es2017",
    },
  },
});
