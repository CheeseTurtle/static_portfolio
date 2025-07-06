import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";

import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  // pluginReact.configs.flat.recommended,
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
    languageOptions: {
      frontmatter: "yaml",
    },
    rules: {
      "markdown/require-alt-text": "off",
      "markdown/fenced-code-language": "warn",
      "markdown/no-bare-urls": "warn",
      "markdown/no-html": "off",
      "markdown/no-duplicate-headings": "warn",
    },
  },
  {
    files: ["**/*.css"],
    plugins: {
      css,
    },
    language: "css/css",
    extends: ["css/recommended"],
  },

  // {
  //   files: ["*/*.astro"],
  //   parser: "astro-eslint-parser",
  //   parserOptions: {
  //     parser: "@typescript-eslint/parser",
  //   },
  // },
  {
    files: ["**/*.astro"],
    plugins: {
      astro: "eslint-plugin-astro",
    },
    extends: ["plugin:astro/recommended"],
    parser: "astro-eslint-parser",
    parserOptions: {
      parser: "@typescript-eslint/parser",
      extraFileExtensions: [".astro"],
    },
    rules: {
      // you can add any Astro-specific rule overrides here
    },
  },
]);
