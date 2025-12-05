import type { MarkdownInstance, MDXInstance } from "astro";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { CollectionEntry/*, RenderResult*/ } from "astro:content";
// import type { JSXElementConstructor } from "react";
import type { ParsedDate } from "../story/util/parseDate";
import type React from "react";

export type ContentInstance<T extends Record<string,any>> = MDXInstance<T> | MarkdownInstance<T>;
export type ProjectContentInstance = ContentInstance<ProjectFrontmatter>;


export type TagKey = 'languages' | 'skills' | 'topics';

type TagCollection = string[] | Set<string>;


// interface ProjectImageInfoBase {
//     type?: 'image' | 'content',
//     path: string,
// };

// interface ProjectImageInfoCaptionBase {
//     caption?: string | undefined,
//     captionPath?: string | undefined
// }

// interface ProjectInfoImageStringCaption extends ProjectImageInfoCaptionBase {
//     caption?: string,
//     captionPath?: undefined,
// }

// interface ProjectInfoImageContentCaption extends ProjectImageInfoCaptionBase {
//     caption?: undefined,
//     captionPath: string
// }


// interface ProjectInfoImage extends ProjectImageInfoBase {
//     type?: 'image',
// }

// interface ProjectInfoContent extends ProjectImageInfoBase {
//     type: 'content'
// }

// type ProjectImageStringInfo = ProjectInfoImage & ProjectInfoImageStringCaption;
// type ProjectImageContentInfo = ProjectInfoImage & ProjectInfoImageContentCaption;

// type ProjectContentStringInfo = ProjectInfoContent & ProjectInfoImageStringCaption;
// type ProjectContentContentInfo = ProjectInfoContent & ProjectInfoImageContentCaption;

// type ProjectImageInfo = {
//     type: 'image',
//     path: string,
//     caption?: string,
//     captionPath?: undefined,
// } | {
//     type: 'image',
//     path: string,
//     caption?: undefined,
//     captionPath: string,
// } | {
//     type: 'content',
//     path: string,
//     caption?: string,
//     captionPath?: undefined,
// } | {
//     type: 'content',
//     path: string,
//     caption?: undefined,
//     captionPath: string,
// };

export type ProjectImageInfo = {
    type?: 'image' | 'content',
    path: string,
    caption?: string,
    captionPath?: string

}

// export type ProjectImageInfo = ProjectImageStringInfo | ProjectImageContentInfo | ProjectContentContentInfo | ProjectContentStringInfo;


type ProjectImageTuple = [string] | [string, string | undefined | null];

export type ProjectImageEntry = string | ProjectImageInfo | ProjectImageTuple;
type ProjectImageArray = ProjectImageEntry[];
export type ProjectImages = ProjectImageArray;


interface ProjectDataBase<C extends TagCollection, D extends number | Date | ParsedDate | string, S extends string | Promise<string> | React.JSX.Element> {
    title: S;
    date: D;
    description: S;
    summary: S;

    category: string;

    audience?: string;

    tags: Record<TagKey, C>;

    images?: ProjectImages;

    exclude?: boolean,
}


export type ProjectFrontmatter = ProjectDataBase<string[], string | number | Date, string>


export interface ProjectInfoWithLBSymbols extends ProjectDataBase<Set<string>, ParsedDate, string> {
    id: string;
    dateStr?: string;
    contentMdx?: string;
    contentHtml?: string;
    contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
    
    lightboxData?: {
        lightboxSources: (string)[], //(React.JSX.Element | string)[],
        lightboxCaptions: (string | null)[],
    }
}


export interface ProjectInfo extends ProjectDataBase<Set<string>, ParsedDate, string | React.JSX.Element> {
    id: string;
    dateStr?: string;
    contentMdx?: string;
    contentHtml?: string;
    contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
    
    lightboxData?: {
        lightboxSources: (React.JSX.Element | string)[], //(React.JSX.Element | string)[],
        lightboxCaptions: (React.JSX.Element | string | null)[],
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
