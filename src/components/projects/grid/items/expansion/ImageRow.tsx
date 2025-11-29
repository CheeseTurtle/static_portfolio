// import { isImageLoader } from "@/components/story/util/typeCheck";
import { ScrollArea } from "@/components/ui/scroll-area";
// import {type ImageLoader, getImageLoader} from "@/components/story/util/loadImages";

interface ImageGalleryProps {
  images: string[]; // array of image URLs
  onImageClick?: (index: number) => void;
}

export function ImageRow({ images, onImageClick }: ImageGalleryProps) {
  return (
    <ScrollArea className="w-full overflow-x-auto">
      <div className="flex space-x-4 py-2">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Image ${i + 1}`}
            className="h-32 w-auto cursor-pointer rounded-lg object-cover hover:scale-105 transition-transform"
            onClick={onImageClick ? () => onImageClick(i) : undefined}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
