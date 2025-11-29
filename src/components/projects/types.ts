import type { MarkdownInstance, MDXInstance } from "astro";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { CollectionEntry/*, RenderResult*/ } from "astro:content";
// import type { JSXElementConstructor } from "react";
import type { ParsedDate } from "../story/util/parseDate";

export type ContentInstance<T extends Record<string,any>> = MDXInstance<T> | MarkdownInstance<T>;
export type ProjectContentInstance = ContentInstance<ProjectFrontmatter>;


export type TagKey = 'languages' | 'skills' | 'topics';

type TagCollection = string[] | Set<string>;


type ProjectImageInfo = {
    path: string,
    caption?: string
}


type ProjectImageTuple = [string] | [string, string | undefined | null];
type ProjectImageArray = (string | ProjectImageInfo | ProjectImageTuple)[];
// type ProjectImageRecord = Record<string, string | undefined>;

type ProjectImages = ProjectImageArray; // | ProjectImageRecord;


interface ProjectDataBase<C extends TagCollection, D extends number | Date | ParsedDate | string> {
    title: string;
    date: D;

    description: string;
    summary: string;

    category: string;

    audience?: string;

    tags: Record<TagKey, C>;

    images?: ProjectImages;
}


export type ProjectFrontmatter = ProjectDataBase<string[], string | number | Date>

export interface ProjectInfo extends ProjectDataBase<Set<string>, ParsedDate> {
    id: string;
    dateStr?: string;
    contentMdx?: string;
    contentHtml?: string;
    contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
    
    lightboxData?: {
        lightboxSources: (React.JSX.Element | string)[],
        lightboxCaptions: (string | null)[],
    }
}

export type ProjectEntry = CollectionEntry<"projects">;
export type Project = ProjectEntry["data"] & { id: string };
export type ProjectData = Project & {
    contentHtml?: string; contentMdx?: string; contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
};

export type ProjectDataWithFactory = ProjectData & { factory: AstroComponentFactory };
    // contentLoader?: () => Promise<MDXInstance<ProjectFrontmatter>>;};
    // renderResult: JSXElementConstructor<any>; }
