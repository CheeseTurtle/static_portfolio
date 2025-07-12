// import type { AstroComponentInstance } from "astro/dist/runtime/server";
import type { AstroComponentInstance } from "astro/runtime/server/index.js";
import { isImageMetadata } from "./typeCheck";

type ImageGetterResult = { default: ImageMetadata };
// type ImageLoader = () => ImageGetterResult;

// type CreateInfo = {
//   imageElem?: AstroComponentInstance;
//   imageMetadata?: ImageMetadata|Promise<ImageGetterResult>|string;
// }
type CreateInfo1 = {
  imageElem: AstroComponentInstance;
  imageMetadata?: undefined;
};
type CreateInfo2 = { imageElem?: undefined; imageMetadata: ImageMetadata };

export default async function getCreateInfo(image: string|undefined, imageSlot: AstroComponentInstance|undefined) {
    
    let createInfo: CreateInfo1 | CreateInfo2;
    let imageElem: AstroComponentInstance | undefined = undefined;
    let imageMetadata: ImageMetadata | Promise<ImageGetterResult> | undefined =
    undefined;
    if (image !== undefined) {
    const regexp = /(?<=^|\/)(?<fn>[^/]+?)(?:\.(?<ext>jpe?g|png|gif))?$/;
    function loadImageMetadata(_reason: any) {
        const loaders = import.meta.glob<() => { default: ImageMetadata }>(
        "/public/images/story/inline/*.{jpg,jpeg,png,gif}"
        );
        for (const filePath in loaders) {
        const m = regexp.exec(filePath);
        if (m === null) continue;
        const loader = loaders[filePath];
        return loader;
        }
    }

    const result = await (import(/* @vite-ignore */ image).catch(
        loadImageMetadata
    ) as Promise<ImageMetadata | Promise<() => ImageMetadata>>);

    if (typeof result === "object" && "default" in result)
        imageMetadata = result.default as ImageMetadata;
    else if (isImageMetadata(result)) {
        imageMetadata = result;
    } else if (typeof result === "function") {
        imageMetadata = result();
        // } else if (result !== undefined) {
        //   // console.log("NEVER IMAGEMETADATA: ", result)
        //   imageMetadata = result;
    } else {
        // console.log("typeof result:", typeof result, Object.keys(result));
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`No image given, or invalid type (${typeof result}): ${result}`);
    }
    if (!imageMetadata) throw new Error("Could not find image");
    // imageElem = Image({
    //   src: imageMetadata,
    //   alt: "(TODO)",
    // }) as AstroComponentInstance;
    // imageElem = <Fragment><Image src={imageMetadata} alt="(TODO)"></Image></Fragment>;
    createInfo = { imageMetadata } as CreateInfo2;
    } else if (imageSlot !== undefined) {
    imageElem = imageSlot;
    createInfo = { imageElem } as CreateInfo1;
    } else {
    throw new Error("No image specified for columns");
    }
    return createInfo;      
}
