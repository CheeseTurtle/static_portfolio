import type { MarkdownInstance, MDXInstance } from "astro";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { CollectionEntry, RenderResult } from "astro:content";
import type { JSXElementConstructor } from "react";
import type { ParsedDate } from "../story/util/parseDate";

export type ContentInstance<T extends Record<string,any>> = MDXInstance<T> | MarkdownInstance<T>;
export type ProjectContentInstance = ContentInstance<ProjectFrontmatter>;


export type TagKey = 'languages' | 'skills' | 'topics';

type TagCollection = string[] | Set<string>;


interface ProjectDataBase<C extends TagCollection, D extends number | Date | ParsedDate | string> {
    title: string;
    date: D;

    description: string;
    summary: string;

    category: string;

    audience?: string;

    tags: Record<TagKey, C>;

    images?: string[];
}


export interface ProjectFrontmatter extends ProjectDataBase<string[], string | number | Date> {}

export interface ProjectInfo extends ProjectDataBase<Set<string>, ParsedDate> {
    id: string;
    dateStr?: string;
    contentMdx?: string;
    contentHtml?: string;
    contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
}

export type ProjectEntry = CollectionEntry<"projects">;
export type Project = ProjectEntry["data"] & { id: string };
export type ProjectData = Project & {
    contentHtml?: string; contentMdx?: string; contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
};

export type ProjectDataWithFactory = ProjectData & { factory: AstroComponentFactory };
    // contentLoader?: () => Promise<MDXInstance<ProjectFrontmatter>>;};
    // renderResult: JSXElementConstructor<any>; }
