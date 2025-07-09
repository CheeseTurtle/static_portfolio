import type { MarkdownInstance, MDXInstance } from "astro";
import type { StorySectionFrontmatter } from "./util/types/types";

export type ContentInstance<T extends Record<string,any>> = MDXInstance<T> | MarkdownInstance<T>;
export type SectionContentInstance = ContentInstance<StorySectionFrontmatter>;
