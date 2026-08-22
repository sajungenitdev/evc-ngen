// eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // ✅ এই রুলটি অফ করুন
      "@typescript-eslint/no-unused-expressions": "off",
      
      // অথবা শুধুমাত্র JSX-এর জন্য অফ করুন
      // "@typescript-eslint/no-unused-expressions": ["error", { "allowShortCircuit": true }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;