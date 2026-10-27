import { defineConfig } from "vite";
import dtsBundleGenerator from "unplugin-dts-bundle-generator/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "IdentisureClient",
      fileName: "identisure-client",
      formats: ["es", "cjs"],
    },
  },
  plugins: [
    dtsBundleGenerator({
      fileName: "identisure-client.d.ts",
    }),
    // CJS consumers need .d.cts types, or TypeScript treats them as ESM declarations.
    dtsBundleGenerator({
      fileName: "identisure-client.d.cts",
    }),
  ],
});
