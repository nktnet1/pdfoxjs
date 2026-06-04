import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";

const defaultConfig: UserConfig = {
  format: "commonjs",
  platform: "node",
  outDir: "./out",
  clean: true,
  minify: true,
  sourcemap: false,
  unbundle: false,
  dts: false,
  deps: {
    neverBundle: ["electron"],
  },
};

export default defineConfig([
  {
    ...defaultConfig,
    entry: "./src/main.ts",
  },
]);
