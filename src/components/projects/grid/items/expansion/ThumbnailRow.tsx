// import { isImageLoader } from "@/components/story/util/typeCheck";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { MouseEvent } from "react";
import type React from "react";
import { PaddedScrollArea } from "./PaddedScrollArea";
// import {type ImageLoader, getImageLoader} from "@/components/story/util/loadImages";

interface ThumbnailGalleryProps {
  items: (string | React.ReactNode)[]; // array of image URLs
//   captions: (string | React.ReactNode)[];
  thumbnails?: (string | React.ReactNode | null)[];
  onImageClick?: (evt: React.MouseEvent<HTMLImageElement | HTMLDivElement>, index: number) => void;
}

export function ThumbnailRow({ thumbnails, items, onImageClick }: ThumbnailGalleryProps) {
  return (
      <ScrollArea className="overflow-y-hidden overflow-x-auto w-full" type="auto"  scrollHideDelay={0}
        // scrollbarProps={{
        //   className: 'p-0'
        // }}
      
      >
        {/* <PaddedScrollArea className="outline-green-500 outline-1 overflow-y-hidden overflow-x-auto w-full m-[-5] p-[0] bg-blue-500" type="auto"  scrollHideDelay={0}> */}
          {/* <div className="flex space-x-4 py-2 w-fit h-min outline-white outline-1 bg-orange-400"></div> */}
          <div className="inline-flex space-x-4 py-2 px-2 box-border w-fit">
            {items.map((src, i) => {
                const thumb = thumbnails?.[i] ?? src;
                const onClick = onImageClick ? (evt: MouseEvent<HTMLImageElement> | MouseEvent<HTMLDivElement>) => onImageClick(evt, i) : undefined;
                return typeof thumb === 'string' ?
                    (<img
                        key={i}
                        src={thumb}
                        alt={`Image ${i + 1}`}
                        className="h-32 w-auto cursor-pointer rounded-lg object-cover hover:scale-105 transition-transform"
                        onClick={onClick}
                    />)
                : (<div className="h-32 w-auto cursor-pointer rounded-lg object-cover hover:scale-105 transition-transform" onClick={onClick}>{thumb}</div>)}
            )}
            {items?.length && <div className="flex-none w-2 mx-[-4]" />}
          </div>
        <ScrollBar orientation="horizontal"></ScrollBar>
      </ScrollArea>
  );
}
