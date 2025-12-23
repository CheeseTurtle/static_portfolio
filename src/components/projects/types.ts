import type { MarkdownInstance, MDXInstance } from "astro";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { CollectionEntry,/*, RenderResult*/ 
Render} from "astro:content";
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


export type ProjectMediaType = 'image' | 'content' | 'embed';
type ProjectMediaInfoBase = {
    id?: string,
    path: string,
    caption?: string,
    captionPath?: string,
}

interface LocalProjectMediaInfo<T extends 'image' | 'content'> extends ProjectMediaInfoBase {
    type?: T
}

interface EmbeddedProjectMediaInfo extends ProjectMediaInfoBase {
    type: 'embed',
    provider: 'youtube';
}


// // type z = (string | number) extends string ? true : false;
// type z = string extends (string | number) ? true : false;

export type ProjectMediaInfo<T extends ProjectMediaType> = (
    T extends 'embed' ? EmbeddedProjectMediaInfo : never
) | ( T extends 'image' | 'content' ? LocalProjectMediaInfo<Extract<T, 'image' | 'content'>> : never);
// ) | (Exclude<T, 'embed'> extends infer TT extends 'image' | 'content'? LocalProjectMediaInfo<TT> : never);



// export type ProjectMediaInfo<T extends ProjectMediaType> = ProjectMediaInfoBase & (
//     (
//         T extends 'image' | 'content' ? (
//             {type?: 'image' | 'content'}
//         ) : never
//     )
//     |
//     (
//         T extends 'embed' ? (
//             {type: 'embed', provider: 'youtube'}
//         ) : never
//     )
// )

// export type ProjectImageInfo = ProjectImageStringInfo | ProjectImageContentInfo | ProjectContentContentInfo | ProjectContentStringInfo;


type ProjectImageTuple = [string] | [string, string | undefined | null];

export type ProjectImageEntry<T extends ProjectMediaType> =  ProjectMediaInfo<T> | (T extends 'image' ? (string | ProjectImageTuple) : never);
export type AnyProjectImageEntry =
  | string
  | ProjectImageTuple
  | LocalProjectMediaInfo<'image'>
  | LocalProjectMediaInfo<'content'>
  | EmbeddedProjectMediaInfo;

export type ProjectImageArray<T extends ProjectMediaType> = ProjectImageEntry<T>[];
export type ProjectImages = AnyProjectImageEntry[]; //ProjectImageArray<ProjectMediaType>;



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


export type LightboxMediaEntryWithLBSymbols<ST extends ProjectMediaType, CT extends Exclude<ProjectMediaType, 'embed'> | null | undefined = any> = {
    id: string,
    source: (
        (ST extends 'image' ? string : never)
        |
        (ST extends 'content' ? symbol : never)
        |
        (ST extends 'embed' ? {sym: symbol, key: string, path: string, provider: string, title?: string} : never)
    ),
    caption?: CT extends ProjectMediaType ? (
        (CT extends 'image' ? string : never)
        |
        (CT extends 'content' ? symbol : never)
    ) : CT,
    thumbnail?: string | symbol | null
}


export type LightboxMediaEntry<ST extends ProjectMediaType, CT extends Exclude<ProjectMediaType, 'embed'> | null | undefined = any> = {
    id: string,
    source: (
        (ST extends 'image' ? string : never)
        |
        (ST extends 'content' ? React.JSX.Element : never)
        |
        (ST extends 'embed' ? {path: string, provider: string, elem: React.JSX.Element, thumbnail?: string | React.JSX.Element, title?: string} : never)
    ),
    caption?: CT extends ProjectMediaType ? (
        (CT extends 'image' ? string : never)
        |
        (CT extends 'content' ? React.JSX.Element : never)
    ) : CT,
    thumbnail?: string | React.JSX.Element | null
}


export type ProjectMediaEmbedData = {
    path: string,
    title?: string,
    provider: 'youtube',
}


export interface ProjectInfoWithLBSymbols extends ProjectDataBase<Set<string>, ParsedDate, string> {
    id: string;
    dateStr?: string;
    contentMdx?: string;
    contentHtml?: string;
    contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
    lightboxData?: {
        // record: {[T in ProjectMediaType]: Record<string, ProjectMediaInfo<T>>},
        record: Partial<{[T in ProjectMediaType]: Record<string, LightboxMediaEntryWithLBSymbols<T>>}>,
        lightboxSources: ([ProjectMediaType, string, string | ProjectMediaEmbedData])[],
        lightboxCaptions: (string | null)[],
        lightboxThumbs?: (string | null)[],
    }
}


export interface ProjectInfo extends ProjectDataBase<Set<string>, ParsedDate, string | React.JSX.Element> {
    id: string;
    dateStr?: string;
    contentMdx?: string;
    contentHtml?: string;
    contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
    lightboxData?: {
        record: Partial<{[T in ProjectMediaType]: Record<string, LightboxMediaEntry<T>>}>,
        lightboxSources: (React.JSX.Element | string)[],
        lightboxCaptions: (React.JSX.Element | string | null)[],
        lightboxThumbs?: (React.JSX.Element | string | null)[],
    }
}

export type ProjectEntry = CollectionEntry<"projects">;
export type ProjectEntryMDX = Omit<ProjectEntry, 'render'> & {
  render(): Render['.mdx']
};

export type Project = ProjectEntry["data"] & { id: string };
export type ProjectData = Project & {
    contentHtml?: string; contentMdx?: string; contentElem?: ReturnType<MDXInstance<ProjectFrontmatter>["Content"]>;
};

export type ProjectDataWithFactory = ProjectData & { factory: AstroComponentFactory, components?: Record<string, AstroComponentFactory>  };
    // contentLoader?: () => Promise<MDXInstance<ProjectFrontmatter>>;};
    // renderResult: JSXElementConstructor<any>; }
