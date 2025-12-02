import { ContentSchemaContainsSlugError } from "node_modules/astro/dist/core/errors/errors-data";
import type { AsyncDefaultLoader } from "./types/types.ts";

export type ImageLoaders = Record<string, () => Promise<{
    default: ImageMetadata;
}>>;

// const imageLoaders = import.meta.glob<{ default: ImageMetadata }>(
//   "/public/images/story/sidebar/*.{jpeg,jpg,png,gif}"
// );


// const contentLoaders = import.meta.glob<
//   | MDXInstance<SidebarSectionFrontmatter>
//   | MarkdownInstance<SidebarSectionFrontmatter>
// >("/src/pages/story/sidebar/*.{md,mdx}", { eager: false });

// TODO: Match sections with imageLoaders and/or content elements (slot, or load from .md(x)?)

// TODO: Populate sidebar and align with StorySections
// TODO: Prepare for animation/pinning choreography

export type ImageLoader = AsyncDefaultLoader<ImageMetadata>;


function _makeImageGlobPattern(path: string) {
  if(path.length > 0 && !path.endsWith('/')) path += '/';
  return path + "*.{jpeg,jpg,png,gif,webp}";
}
export function makeImageGlobPattern(path: string | string[]) {
  if(typeof path === 'string') return _makeImageGlobPattern(path);
  return path.map(_makeImageGlobPattern);
}

function _getImageLoader(imageLoaders: ImageLoaders, prepath: string, fn: string): ImageLoader | undefined {
  // const prepath = "/public/images/story/sidebar/" + fn;
  if(prepath.length > 0 && !prepath.endsWith('/')) prepath += '/';
  prepath += fn;
  if (prepath in imageLoaders) return imageLoaders[prepath];
  for (const ext of [".jpg", ".jpeg", ".png", ".gif", ".webp"]) {
    const testpath = prepath + ext;
    if (testpath in imageLoaders) return imageLoaders[testpath];
  }
}
export function getImageLoader(imageLoaders: ImageLoaders, prepath: string | string[], fn: string): ImageLoader | undefined {
  if (fn in imageLoaders) return imageLoaders[fn];
  if(typeof prepath === 'string') return _getImageLoader(imageLoaders, prepath, fn);
  let path: string
  for(path of prepath) {
    const loader = _getImageLoader(imageLoaders, path, fn);
    if(undefined !== loader) return loader;
  } 
}


function trimPublicRoot(path: string): string {
  if(path.startsWith('/public/')) return path.slice(7);
  return path;
}


function _getImagePath(imagePaths: Set<string>, prepath: string, fn: string): string | undefined {
  // const prepath = "/public/images/story/sidebar/" + fn;
  if(prepath.length > 0 && !prepath.endsWith('/')) prepath += '/';
  prepath += fn;
  // console.log(prepath);
  if(imagePaths.has(prepath)) return trimPublicRoot(prepath);
  for (const ext of [".jpg", ".jpeg", ".png", ".gif", ".webp"]) {
    const testpath = prepath + ext;
    // console.log(testpath)
    if(imagePaths.has(testpath)) return trimPublicRoot(testpath);
  }
}
export function getImagePath(imagePaths: Set<string>, prepath: string | string[], fn: string): string | undefined {
  // console.log(imagePaths);
  if(imagePaths.has(fn)) return trimPublicRoot(fn);
  if(typeof prepath === 'string') return _getImagePath(imagePaths, prepath, fn);
  let path: string
  for(path of prepath) {
    // console.log('PREPATH:', path)
    const matchPath = _getImagePath(imagePaths, path, fn);
    if(undefined !== matchPath) return matchPath;
  } 
}


