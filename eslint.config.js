import { next } from "@next/eslint-plugin-next";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  next(),
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/prisma/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
