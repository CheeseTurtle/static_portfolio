import type { MarkdownInstance, MDXInstance } from "astro";

export type ContentInstance<T extends Record<string,any>> = MDXInstance<T> | MarkdownInstance<T>;
export type SectionContentInstance = ContentInstance<StorySectionFrontmatter>;
