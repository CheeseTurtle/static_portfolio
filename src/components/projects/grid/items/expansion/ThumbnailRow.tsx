// import { isImageLoader } from "@/components/story/util/typeCheck";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MouseEvent } from "react";
import type React from "react";
// import {type ImageLoader, getImageLoader} from "@/components/story/util/loadImages";

interface ThumbnailGalleryProps {
  items: (string | React.ReactNode)[]; // array of image URLs
//   captions: (string | React.ReactNode)[];
  thumbnails?: (string | React.ReactNode | null)[];
  onImageClick?: (evt: React.MouseEvent<HTMLImageElement | HTMLDivElement>, index: number) => void;
}

export function ThumbnailRow({ thumbnails, items, onImageClick }: ThumbnailGalleryProps) {
  return (
    <ScrollArea className="w-full overflow-x-auto">
      <div className="flex space-x-4 py-2">
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
      </div>
    </ScrollArea>
  );
}
