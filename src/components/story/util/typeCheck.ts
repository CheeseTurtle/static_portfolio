import type { ImageMetadata, MDXInstance, MarkdownInstance } from "astro";
import type { AstroComponentInstance,ComponentSlots as ComponentSlots_, ServerIslandComponent } from "astro/runtime/server/index.js";
import type { AstroComponentMetadata, AstroComponentDirectives } from "astro";
import type { Component, ComponentChildren, ComponentChild, ComponentProps, ComponentType, AnyComponent } from "preact";
import type { ComponentSlotValue, ComponentSlots } from "astro/runtime/server/render/slot.js";
// import type { DevToolbarHighlight } from "astro/runtime/client/dev-toolbar/ui-library/highlight.js";
import type {
  Context,
  ContextType,
  FunctionComponent,
  FunctionalComponent,
  ComponentClass,
  ComponentConstructor,
  ComponentFactory} from "preact";
import type { ContentInstance, DefaultObjectPromise, Loader } from "./types/types";



export  function isImageMetadata(value: unknown): value is ImageMetadata {
    return (
      typeof value === "object" &&
      value !== null &&
      "src" in value &&
      "width" in value &&
      "format" in value &&
      "orientation" in value &&
      "height" in value
    );
}

export function isContentInstance(x: any): x is ContentInstance<any> {
  return x !== undefined && "Content" in x;
}
// export function isImageMetadata(
//   x: any //ImageMetadata | MarkdownInstance<any> | MDXInstance<any>
// ): x is ImageMetadata {
//   return "src" in x && "width" in x && "height" in x && "format" in x;
// }


// TODO: Escape filename?
// const regexp = RegExp("(?<=^|/)" + image + "(?:.(?<ext>jpe?g|png|gif))?$");
export function isImageLoader(
  x:
    | ImageMetadata
    | Loader<ImageMetadata | DefaultObjectPromise<ImageMetadata>>
    | string
): x is Loader<ImageMetadata | DefaultObjectPromise<ImageMetadata>> {
  return typeof x === "function";
}
// async function wrapResult(x: ImageMetadata|ImageLoader): Promise<ImageMetadata|ImageLoader> {
//   return x;
//   // if(!isImageLoader(x)) return x;
//   // const p = new Promise<ImageLoader>((resolve) =>
//   //   resolve(x)
//   // );
//   // return p;
// }

export function isMdxInstance(
  x: MarkdownInstance<any> | MDXInstance<any>
): x is MDXInstance<any> {
  // console.log("Is MDX Instance?", x);
  return !("rawContent" in x);
}



