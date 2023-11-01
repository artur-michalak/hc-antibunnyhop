import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import del from "rollup-plugin-delete";
import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: Object.fromEntries(
    glob.sync("src/**/*.ts").map((file) => [
      // This remove `src/` as well as the file extension from each
      // file, so e.g. src/nested/foo.js becomes nested/foo
      path.relative(
        "src",
        file.slice(0, file.length - path.extname(file).length)
      ),
      // This expands the relative paths to absolute paths, so e.g.
      // src/nested/foo becomes /project/src/nested/foo.js
      fileURLToPath(new URL(file, import.meta.url)),
    ])
  ),
  output: {
    format: "es",
    dir: "dist",
  },
  plugins: [
    typescript(),
    del({ targets: "dist/*" }),
    copy({
      targets: [
        {
          src: "src/**/public",
          dest: "dist",
          rename: (name, extension, fullPath) =>
            fullPath.substring(
              fullPath.indexOf("/") + 1,
              fullPath.indexOf("/public")
            ),
        },
      ],
    }),
    terser({ ecma: 2017, mangle: true }),
  ],
};
