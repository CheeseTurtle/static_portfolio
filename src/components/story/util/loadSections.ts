// import {
//   getCollection,
//   getEntries,
//   getEntry,
//   render,
//   reference,
// } from "astro:content";

import type { MarkdownInstance, MDXInstance } from "astro";
import type { StorySectionFrontmatter } from "./types/types";
import parseDate from "./parseDate";



export default function loadSections() {
  const allSectionsRecord = import.meta.glob<
    | MarkdownInstance<StorySectionFrontmatter>
    | MDXInstance<StorySectionFrontmatter>
  >("/src/pages/story/sections/*.{md,mdx}", { eager: true });
  const allSections = Object.values(allSectionsRecord);
  // console.log("HELLO");

  function parseDateOrder(x: string): number {
    const d = parseDate(x)[0];
    return d.valueOf();
  }

  allSections.sort(
    (a, b) =>
      parseDateOrder(a.frontmatter.date) - parseDateOrder(b.frontmatter.date)
  );

  return allSections;
}
