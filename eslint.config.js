import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import pluginAstro from "eslint-plugin-astro";
import * as pluginMDX from 'eslint-plugin-mdx';
import pluginAstroParser from 'astro-eslint-parser';
import pluginTSeslintParser from '@typescript-eslint/parser';
import eslint from "@eslint/js";

import pluginReactHooks from "eslint-plugin-react-hooks";

import { defineConfig } from "eslint/config";

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
// console.log('directory-name 👉️', __dirname);

// 👇️ "/home/borislav/Desktop/javascript/dist/index.html"
// console.log(path.join(__dirname, '/dist', 'index.html'));


export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommendedTypeChecked,
  // // @ts-expect-error Incompatibility
  // tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // projectService: true,
        projectService: {
          // allowDefaultProject: ["*.js"],
          projectFolderIgnoreList: ["**/node_modules/**", "**/dist/**"],
        },
        tsconfigRootDir: __dirname ?? import.meta.dirname,
      },
    },
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // plugins: { js },
  },
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{ts,tsx,d.ts,cts}"],
    rules: {
      "no-redeclare": "off",
    },
  },
  {
    // files: ["**/*.{js,mjs,cjs,mts,cts,ts,jsx,tsx,d.ts,mdx}"],
    files: ["**/*.{mts,cts,ts,tsx,d.ts}"],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: [],
      },
    },
    rules: {
      "no-undef": "off", // Not supported for Typescript
      "no-unused-vars": "off", // Use Typescript check instead
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "warn",
      "@typescript-eslint/only-throw-error": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          vars: "local", // or after-used?
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
          // ignoreClassWithStaticInitBlock: true,
          // ignoreUsingDeclarations: true,
        },
      ],
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",

      "@typescript-eslint/no-inferrable-types": "off",
    },
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
    ...tseslint.configs.disableTypeChecked,
    files: ["**/*.mdx"],
  },
  {
    files: ["**/*.mdx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    }
  },
  pluginMDX.flat,
  pluginMDX.flatCodeBlocks,
  // {
  //   ...pluginMDX.flat,
  //   files: ["**/*.mdx"],
  //   processor: pluginMDX.createRemarkProcessor({
  //     lintCodeBlocks: true,
  //     // languageMapper: {},
  //     // cwd: __dirname,
  //     // ignoreRemarkConfig: false,
  //     // remarkConfigPath: './.remarkrc.js',
  //     // remarkConfigPath: './.remarkrc.js', // Point to your remark config
  //   }),
  //   // languageOptions: {
  //   //   parserOptions: {
  //   //     // ignoreRemarkConfig: false,
  //   //     // remarkConfigPath: './.remarkrc.js'
  //   //   }
  //   // }
  // },
  // {
  //   ...pluginMDX.flatCodeBlocks,
  //   rules: {
  //     ...pluginMDX.flatCodeBlocks.rules,
  //     // Override rules for code blocks if needed
  //   },
  // },
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
      astro: pluginAstro,
    },
    // parser: pluginAstroParser, //"astro-eslint-parser",
    languageOptions: {
      parser: pluginAstroParser,
      parserOptions: {
        // project: "./tsconfig.json",
        // parser: "@typescript/eslint-parser",
        // parser: "@typescript-eslint/parser",
        parser: pluginTSeslintParser,
        extraFileExtensions: [".astro"],
        projectService: {
          allowDefaultProject: ["*.astro","**/*.astro"],
          projectFolderIgnoreList: ["**/node_modules/**", "**/dist/**"],
        },
        // project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // rules: {
    //   // you can add any Astro-specific rule overrides here

    // },
  },
]);
