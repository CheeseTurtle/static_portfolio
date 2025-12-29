// // @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
// import preact from "@astrojs/preact";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap"
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
// import preactVite from "@preact/preset-vite";
// import reactVite from "@vitejs/plugin-react";

import rehypeStarryNight from "rehype-starry-night";
import rehypeSplitCodeLines from "./plugins/rehypeStarryNightLines.js";
import { common } from '@wooorm/starry-night';

import remarkHighlight from './plugins/remarkHighlight.js';
import rehypeHighlight from './plugins/rehypeHighlight.js';


import sourceAstro from "@wooorm/starry-night/source.astro";

import sourceJs from "@wooorm/starry-night/source.js";
import sourceTs from "@wooorm/starry-night/source.ts";
import sourceTsx from "@wooorm/starry-night/source.tsx";
import textMd from "@wooorm/starry-night/text.md";

import sourceMdx from "@wooorm/starry-night/source.mdx";

import sourceProlog from "@wooorm/starry-night/source.prolog";
import sourceYAML from "@wooorm/starry-night/source.yaml";

import sourcePowerShell from "@wooorm/starry-night/source.powershell";
import sourcePython from "@wooorm/starry-night/source.python";

import sourceASM from "@wooorm/starry-night/source.assembly";

import textTeX from "@wooorm/starry-night/text.tex";
import textLaTeX from "@wooorm/starry-night/text.tex.latex";
import textHTML from "@wooorm/starry-night/text.html";
import textHTML_JS from "@wooorm/starry-night/text.html.js";
// import textHTML_CSS from "@wooorm/starry-night/text.html.cshtml";
import sourceCSS from "@wooorm/starry-night/source.css";
import sourceSCSS from "@wooorm/starry-night/source.css.scss";
// import postCSS from "@wooorm/starry-night/source.postcss";


// import remarkFrontmatter from 'remark-frontmatter';
// import remarkMdxFrontmatter from 'remark-mdx-frontmatter';


import staticCopy from './plugins/tailwindStaticCopy.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));




const isProduction = process.env.GITHUB_PAGES === "true";


//  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//  function debugRemarkLog(when) {
//   return ()=>{
//     return (tree) => {
//       // run this immediately after remarkHighlight in the pipeline
//       const str = JSON.stringify(tree, null, false);
//       if(str.includes('=='))
//         console.log(`MDAST ${when} remarkHighlight:`, str);
//     };
//   }
// }

// // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
// function debugRehypeLog(when) {
//   return () => { 
//     return (tree) => {
//       const str = JSON.stringify(tree, null, false);
//       if(str.includes('mark'))
//         console.log(`HAST ${when} rehypeHighlight:`, str);
//     };
//   }
// }

// https://astro.build/config
// // eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({

  tsconfig: "./tsconfig.json",
  // prefetch: true,
  site: "https://cheeseturtle.github.io/static_profile",
  base: isProduction ? '/static_profile/' : '/',
  // experimental: {
  //   // clientPrerender: true,
  //   // headingIdCompat: true,
  //   // liveContentCollections: false,
  //   // preserveScriptOrder: undefined,
  //   contentIntellisense: true,
  // },
  integrations: [
    react(),
    icon(),
    mdx({
      // components: 'src/components/mdx.ts',
      extendMarkdownConfig: true,
      syntaxHighlight: false,
      remarkPlugins: [
      //   remarkFrontmatter,
      //   remarkMdxFrontmatter,
        // debugRemarkLog('pre'),
        remarkHighlight,
        // debugRemarkLog('post'),
      ],
      rehypePlugins: [
        rehypeHighlight,
        [ 
          rehypeStarryNight,
          {
            allowMissingScopes: false,
            // plainText: [],
            grammars: [...common, sourceAstro, sourceJs, sourceTs, sourceTsx, textMd, sourceMdx, sourceProlog, sourcePowerShell, sourceYAML, sourcePython,
              sourceASM, sourceCSS, sourceSCSS, textTeX, textLaTeX, textHTML, textHTML_JS,
            ],
            // aliases: {
            //   js: "javascript",
            //   ts: "typescript",
            //   tsx: "tsx",
            //   mdx: "mdx",
            // }
          }
        ],
        // debugRehypeLog('pre'),
        rehypeSplitCodeLines,
        // debugRehypeLog('post'),
      ]
    }),
    sitemap({
      filter: (page) =>
        !page.includes("/blog/tags") &&
        !page.includes("/blog/topics") &&
        !page.includes("/story/sections") &&
        !page.includes("/story/sidebar"),
    }),
  ],
  // devToolbar: {
  //   enabled: false,
  // },
  // server: {
  //   watch: {
  //     usePolling: true
  //   }
  // },
  vite: {
    plugins: [
      tailwindcss(),
      staticCopy,
    ], // Don't pass config here --use config file
    logLevel: 'info',
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // console.log('WARNING:', warning);
          // warn(warning);

           // ignore circular dependency warnings in node_modules
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.ids.some(id => id.includes('node_modules'))) {
            return;
          }
          warn(warning);
        }
      }
    },
    resolve: {
      alias: {
        // "#globals": "src/styles/globals.css",
        '@': path.resolve(__dirname, './src'),
        // '@components': path.resolve(__dirname, './src/components'),
        '@styles': path.resolve(__dirname, './src/styles'),
        // '@lib': path.resolve(__dirname, './src/lib'),
        // '@utils': path.resolve(__dirname, './src/utils'),
        "preact": "react",
        "preact/hooks": "react",
         'react/hooks': 'react', // Redirect bad imports to main react
        // "react": "@preact/compat",
        // 'react-dom/test-utils': 'preact/test-utils',
        // 'react-dom': '@preact/compat',
        // 'react/jsx-runtime': 'preact/jsx-runtime',
      }
    },
  },
  markdown: {
    // syntaxHighlight: true,
    shikiConfig: {
      theme: "solarized-dark",
    },
  },
});