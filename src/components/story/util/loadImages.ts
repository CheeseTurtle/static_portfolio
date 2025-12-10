// import { ContentSchemaContainsSlugError } from "node_modules/astro/dist/core/errors/errors-data";
import type { AsyncDefaultLoader } from "./types/types.ts";

export type ImageLoaders = Record<string, () => Promise<{
    default: ImageMetadata;
}>>;

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
  if(prepath.length > 0 && !prepath.endsWith('/')) prepath += '/';
  prepath += fn;
  if(imagePaths.has(prepath)) return trimPublicRoot(prepath);
  for (const ext of [".jpg", ".jpeg", ".png", ".gif", ".webp"]) {
    const testpath = prepath + ext;
    if(imagePaths.has(testpath)) return trimPublicRoot(testpath);
  }
}
export function getImagePath(imagePaths: Set<string>, prepath: string | string[], fn: string): string | undefined {
  if(imagePaths.has(fn)) return trimPublicRoot(fn);
  if(typeof prepath === 'string') return _getImagePath(imagePaths, prepath, fn);
  let path: string
  for(path of prepath) {
    const matchPath = _getImagePath(imagePaths, path, fn);
    if(undefined !== matchPath) return matchPath;
  } 
}


