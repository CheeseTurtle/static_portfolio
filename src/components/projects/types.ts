import type { MarkdownInstance, MDXInstance } from "astro";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { CollectionEntry, RenderResult } from "astro:content";
import type { JSXElementConstructor } from "react";

export type ContentInstance<T extends Record<string,any>> = MDXInstance<T> | MarkdownInstance<T>;
export type ProjectContentInstance = ContentInstance<ProjectFrontmatter>;


export interface ProjectFrontmatter {
    title: string;
    year: number;

    description: string;
    summary: string;

    category: string;

    audience?: string;

    tags?: {
        languages?: string[];
        skills?: string[]; // and concepts
        topics?: string[];
    };

    images?: string[];
}


export type ProjectEntry = CollectionEntry<"projects">;
export type Project = ProjectEntry["data"] & { id: string };

export type ProjectData = Project & {
    contentHtml?: string; contentMdx?: string; contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
};

export type ProjectDataWithFactory = ProjectData & { factory: AstroComponentFactory };
    // contentLoader?: () => Promise<MDXInstance<ProjectFrontmatter>>;};
    // renderResult: JSXElementConstructor<any>; }
