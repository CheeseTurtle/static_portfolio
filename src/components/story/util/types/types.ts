import type { MarkdownInstance, MDXInstance, AstroSlotAttributes } from "astro";

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