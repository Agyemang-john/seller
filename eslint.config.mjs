import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-config-next 16 ships flat configs; wrapping them in FlatCompat (the
// old setup) crashed ESLint with "Converting circular structure to JSON".
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "public/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
