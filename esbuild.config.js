const {resolve} = require('path');
const esbuild = require("esbuild");
const copyStaticFiles = require("esbuild-copy-static-files");

esbuild.build({
  entryPoints: [resolve(__dirname, "src", "client.ts")],
  outfile: "dist/client.js",
  bundle: true,
  minify: true,
  platform: "neutral",
  sourcemap: false,
  target: "es2017",
  plugins: [
    copyStaticFiles({
      src: resolve(__dirname, "public"),
      dest: resolve(__dirname, "dist")
    }),
  ],
});
