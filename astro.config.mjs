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

// https://astro.build/config
// // eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({
  tsconfig: "./tsconfig.json",
  // prefetch: true,
  site: "https://cheeseturtle.github.io/static_profile/",
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
    mdx(),
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    plugins: [tailwindcss()],
    logLevel: 'info',
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          console.log('WARNING:', warning);
          warn(warning);
        }
      }
    },
    resolve: {
      alias: {
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
    shikiConfig: {
      theme: "github-dark",
    },
  },
});