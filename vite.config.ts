import { defineConfig } from "vite";
import dtsBundleGenerator from "unplugin-dts-bundle-generator/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "IdkollenClient",
      fileName: "idkollen-client",
      formats: ["es", "cjs"],
    },
  },
  plugins: [
    dtsBundleGenerator({
      fileName: "idkollen-client.d.ts",
    }),
  ],
});
