// // @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap"
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import preactVite from "@preact/preset-vite";

// https://astro.build/config
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({
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
    preact(),
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
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    plugins: [preactVite(), tailwindcss()],
    resolve: {
      alias: {
        "react": "preact/compat",
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      }
    }
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
});