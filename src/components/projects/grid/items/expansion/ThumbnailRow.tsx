// import { isImageLoader } from "@/components/story/util/typeCheck";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { MouseEvent } from "react";
import React from "react";
// import { PaddedScrollArea } from "./PaddedScrollArea";
// import {type ImageLoader, getImageLoader} from "@/components/story/util/loadImages";

import imagesLoaded from 'imagesloaded';
import { Skeleton } from "@/components/ui/skeleton";

interface ThumbnailGalleryProps {
  items: (string | React.ReactNode)[]; // array of image URLs
//   captions: (string | React.ReactNode)[];
  thumbnails?: (string | React.ReactNode | null)[];
  onImageClick?: (evt: React.MouseEvent<HTMLImageElement | HTMLDivElement>, index: number) => void;
}

export function ThumbnailRow({ thumbnails, items, onImageClick }: ThumbnailGalleryProps) {
  const itemElems = React.useMemo(()=>items.map((src, i) => {
    const thumb = thumbnails?.[i] ?? src;
    // console.log('THUMBNAIL:', thumb);
    const onClick = onImageClick ? (evt: MouseEvent<HTMLImageElement> | MouseEvent<HTMLDivElement>) => onImageClick(evt, i) : undefined;
    return typeof thumb === 'string' ?
    (<img key={i} src={thumb} alt={`Image ${i + 1}`} className="h-32 w-auto cursor-pointer rounded-lg object-cover hover:scale-105 transition-transform" onClick={onClick} loading="lazy" decoding="async" />)
    : (<div key={i} className="h-32 w-auto cursor-pointer rounded-lg object-cover hover:scale-105 transition-transform" onClick={onClick}>{thumb}</div>)}
  ), [items, onImageClick, thumbnails]);

  const numPlaceholderColumns = React.useMemo(()=>Math.min(items.length, 2), [items]);

  const itemPlaceholders = React.useMemo(()=><div className="grid grid-flow-col auto-cols-fr gap-4 w-[calc(100cqw-4*var(--spacing))] h-32 py-2">
    {numPlaceholderColumns ? (new Array(numPlaceholderColumns)).fill(undefined).map(
      (_, i)=><Skeleton key={i} className="w-auto h-auto rounded-4xl"></Skeleton>
    ) : null}
  </div>, [numPlaceholderColumns]);

  const divRef = React.useRef<HTMLDivElement>(null);

  const alreadyMounted = React.useRef<boolean>(false);

  React.useEffect(()=>{
    if(!divRef.current || !items?.length) return;
    
    const onCompletion: ImagesLoaded.ImagesLoadedCallback = (instance) => {
      // if(!alreadyMounted.current) console.log('Completed loading', alreadyMounted.current);
      if(instance && instance.images.length)
        alreadyMounted.current = true;
    }
    
    // const onProgress: ImagesLoaded.ImagesLoadedListener = (_instance, image) => {
    //   if(!alreadyMounted.current) console.log('Image loaded:', alreadyMounted.current, image?.isLoaded, image?.img)
    // }

    const imgLoad = imagesLoaded(divRef.current, onCompletion);

    // imgLoad.on('progress', onProgress);

    return () => {
      imgLoad.off('always', onCompletion);
      // imgLoad.off('progress', onProgress);
    }
  }, [items]);

  // React.useInsertionEffect(()=>{
  //   if(!items?.length || alreadyMounted.current) return;
  //   // console.log('Beginning loading');  
  // }, [items]);

  React.useInsertionEffect(()=>{
    // const handle = requestAnimationFrame(()=>{
    //   alreadyMounted.current = true;
    // });
    return () => {
      // cancelAnimationFrame(handle);
      // console.log('Unmounting');
      alreadyMounted.current = false;
    }
  }, []);
  
  if(!items?.length) return null;

  // TODO: scrollHideDelay, type
  return (
      <ScrollArea className="overflow-y-hidden overflow-x-auto w-full @container/thumb-scroll" type="auto" style={{shapeRendering: "optimizeSpeed", textRendering: "optimizeSpeed", colorRendering: "optimizeSpeed", imageRendering: "auto", contentVisibility: "auto"}}>
          <div ref={divRef} className="inline-flex space-x-4 py-2 px-2 box-border w-fit">
            {alreadyMounted ? <>
              {itemElems} 
              <div className="flex-none w-2 mx-[-4]" />
            </> : itemPlaceholders}
          </div>
        <ScrollBar orientation="horizontal"></ScrollBar>
      </ScrollArea>
  );
}
