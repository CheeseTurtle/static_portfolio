// // @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap"
import icon from "astro-icon";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  // prefetch: true,
  site: "https://cheeseturtle.github.io/static_profile",
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
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
});