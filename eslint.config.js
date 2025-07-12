import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import pluginAstro from "eslint-plugin-astro";
import pluginAstroParser from '@typescript-eslint/parser';
// import pluginAstroParser from 'astro-eslint-parser';
import eslint from "@eslint/js";

import { defineConfig } from "eslint/config";


export default defineConfig([
  eslint.configs.recommended,
  // // @ts-expect-error Incompatibility
  // tseslint.configs.eslintRecommended,
  // // @ts-expect-error Incompatibility
  // tseslint.configs.recommendedTypeChecked,
  // // @ts-expect-error Incompatibility
  // tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // projectService: true,
        projectService: {
          // allowDefaultProject: ["*.js"],
          projectFolderIgnoreList:  ["**/node_modules/**", "**/dist/**"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{js,mjs,cjs,mts,cts,ts,jsx,tsx,.d.ts,mdx,astro}"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "warn",
      "@typescript-eslint/only-throw-error": "warn",
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
    ],
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",

      "@typescript-eslint/no-inferrable-types": "off",
    }
  },
  

  // pluginReact.configs.flat.recommended,
  {
    ...markdown.configs.recommended,
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
  },
  {
    ...json.configs.recommended,
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
  },
  {
    ...markdown.configs.recommended,
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
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
    ...css.configs.recommended,
    files: ["**/*.css"],
    plugins: {
      css,
    },
    language: "css/css",
  },

  // {
  //   files: ["*/*.astro"],
  //   parser: "astro-eslint-parser",
  //   parserOptions: {
  //     parser: "@typescript-eslint/parser",
  //   },
  // },
  pluginAstro.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    plugins: {
      astro: pluginAstro
    },
    // parser: pluginAstroParser, //"astro-eslint-parser",
    languageOptions: {
      parser: pluginAstroParser,
      parserOptions: {
        parser: "@typescript/eslint-parser",
        extraFileExtensions: [".astro"],
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module',
      },
    },
    // rules: {
    //   // you can add any Astro-specific rule overrides here
 
    // },
  },
]);
