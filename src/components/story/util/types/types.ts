import type { MarkdownInstance, MDXInstance } from "astro";
import React from "react";
import type { JSXElementConstructor, PropsWithChildren } from "react";
import type {Node as VisitedNode} from "unist";


export type ComponentChildren = React.ReactNode | undefined;

export interface ImageWindow {
  /**
   * X position of window (relative to section)
   *
   * @type {(string|number)}
   */
  x: string | number;

  /**
   * Y position of window (relative to section)
   *
   * @type {(string|number)}
   */
  y: string | number;

  /**
   * Width of window (optional)
   *
   * @type {?(string|number)}
   */
  windowWidth?: string | number;

  /**
   * Height of the window
   *
   * @type {string|number}
   */
  windowHeight: string | number;

  /**
   * Height of the image (optional)
   *
   * @type {?(string|number)}
   */
  imageHeight?: string | number;

  /**
   * Width of window (optional)
   *
   * @type {?(string|number)}
   */
  imageWidth?: string | number;

  /**
   * Path to image
   *
   * @type {string}
   */
  image: string;
}

export interface ImageWindowArgs extends ImageWindow {
  sectionId: string;
}

export interface StorySectionFrontmatter {
  /**
   * Navigation label
   *
   * @type {string}
   */
  title: string;

  /**
   * ID used for identifying this section; also used for locating related elements.
   *
   * @type {string}
   */
  id: string;

  /**
   * Date that section corresponds to. (Used for sorting.)
   * Format: YYYY, YYYY-MM, or YYYY-MM-DD
   *
   * @type {string}
   */
  date: string;

  backdropImage?: string;

  /**
   * Side content selector/element -- overrides `sideImage`. (optional)
   *
   * @type {?(string|Element)}
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  sideContent?: string | Element | "true";

  /**
   * Side image filepath -- ignored when `sideContent` is given. (optional)
   *
   * @type {?string}
   *
   */
  sideImage?: string;

  /**
   * Image window(s) corresponding to section
   *
   * @type {?ImageWindow[]}
   */
  imageWindows?: ImageWindow[];
}

export interface SidebarSectionFrontmatter {
  sectionId: string;
}

export type ContentInstance<T extends Record<string,any>> = MarkdownInstance<T>|MDXInstance<T>;

export type SectionContentInstance = ContentInstance<StorySectionFrontmatter>;
export type SectionMDXInstance = MDXInstance<StorySectionFrontmatter>;
export type SectionMarkdownInstance = MarkdownInstance<StorySectionFrontmatter>;

export type Loader<T> = () => T;
export type DefaultObject<T> = {default: T};
export type DefaultObjectPromise<T> = Promise<DefaultObject<T>>;
export type DefaultPromiseObject<T> = DefaultObject<Promise<T>>;
export type DefaultLoader<T> = () => DefaultObject<T>;
export type AsyncLoader<T> = ()=>Promise<T>;
export type AsyncDefaultLoader<T> = ()=>DefaultObjectPromise<T>;
export type LoaderPromise<T> = Promise<Loader<T>>;


export interface ParallaxWindowArgs {
  sectionId: string;
  image: null|Loader<DefaultObjectPromise<ImageMetadata>>
}


// interface PropsBase {
//     // sectionId: string;
//     children?: ComponentChildren;
// }
export interface ImageMarkerProps extends PropsWithChildren {
    imageName?: string;
};
export interface MarkdownMarkerProps extends PropsWithChildren {
    contentFile?: string;
}

export interface ElemMarkerProps extends PropsWithChildren {
    children: ComponentChildren;
}

export type ContentMarkerProps = MarkdownMarkerProps|ImageMarkerProps|ElemMarkerProps;
export type ContentMarkerData = [VisitedNode, string|Element, boolean];
export type ContentMarkerDataEntry = [string,ContentMarkerData];

export type FullContentMarkerData = [MDXInstance<StorySectionFrontmatter>,VisitedNode, string|Element, boolean];
export type FullContentMarkerDataEntry = [string,FullContentMarkerData];


export type ContentMarkerContentElement = (Element&{enter:()=>any, leave:()=>any});
export type ContentMarkerElement = (HTMLSpanElement & {content: null|ContentMarkerContentElement, sectionElem: HTMLElement});

export type StorySectionElement = (HTMLElement & {backdrop: {item: HTMLDivElement, img?: HTMLImageElement, wrapper: HTMLDivElement}});

// type MilestoneElement = (HTMLElement & {date: Date, dateString: string});

export type Milestone = {
    index: number,
    sectionId: string
    date?: Date,
    dateString?: string,
    elem: HTMLElement,
    alignElem?: HTMLHeadingElement,
    isMarker: boolean,
};



export type StoryTimelineProps = {
  sections: SectionContentInstance[],
  markers: FullContentMarkerDataEntry[]

};




// export type VHTMLNode<T extends HTMLElement> = React.ReactHTMLElement<T>;
// export type DetailedVHTMLNode<T extends HTMLElement> = React.DetailedReactHTMLElement<React.DetailedHTMLProps<React.HTMLAttributes<T>,T>, T>;
// export type VReactNode<T extends Element> = React.ReactElement<any, string | JSXElementConstructor<T>>

export type VHTMLNode<T> = React.DetailedHTMLProps<React.HTMLAttributes<T>,T>;
export type VReactNode<
  P = any,
  T extends string | JSXElementConstructor<P> = string | JSXElementConstructor<P>
> = React.ReactElement<P, T>;

// type DistributeVNode<T> = (T extends HTMLElement ? VHTMLNode<T> : VReactNode<T>);
// export type VNode<T extends string | JSXElementConstructor<any> | HTMLElement> = DistributeVNode<T>;
export type VNode<T extends string | JSXElementConstructor<any> | HTMLElement> = (T extends HTMLElement ? VHTMLNode<T> : (T extends string|JSXElementConstructor<T> ? VReactNode<any,T> : VReactNode<T>));
// export type DetailedVNode<T extends string | JSXElementConstructor<any> | HTMLElement> = (T extends HTMLElement ? DetailedVHTMLNode<T> : (T extends string|JSXElementConstructor<T> ? VReactNode<any,T> : VReactNode<T>));


// interface DetailedReactSVGElement<P, T extends SVGElement> extends ReactSVGElement<T> {
//   type: keyof React.ReactSVG; // 'circle', 'path', etc.
//   props: P & React.ClassAttributes<T> & React.SVGAttributes<T>;
// }