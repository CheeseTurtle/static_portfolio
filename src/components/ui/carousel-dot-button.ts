// import { cn } from "@/lib/utils";
// import type {EmblaCarouselType} from "embla-carousel";
// import useEmblaCarousel from "embla-carousel-react";
// import { useCallback, useEffect, useState } from "react";

// type UseDotButtonType = {
//   selectedIndex: number
//   // scrollSnaps: number[]
//   // scrollSnapList: number[]
//   onDotButtonClick: (index: number) => void
//   slideIndices: number[]
//   slideNodes: HTMLElement[]
// }

// export const useDotButton = (
//   // emblaApi: EmblaCarouselType | undefined,
//   onButtonClick?: (emblaApi: EmblaCarouselType) => void
// ): UseDotButtonType => {
//   const [selectedIndex, setSelectedIndex] = useState<number>(0)
//   const [slideIndices, setSlideIndices] = useState<number[]>([])
//   const [slideNodes, setSlideNodes] = useState<HTMLElement[]>([])

//   const {api: emblaApi} = useCarou

//   const onDotButtonClick = useCallback(
//     (index: number) => {
//       if (!emblaApi) return;
//       emblaApi.scrollTo(index);
//       onButtonClick?.(emblaApi);
//     },
//     [emblaApi, onButtonClick]
//   )

//   const onInit = useCallback((emblaApi: EmblaCarouselType) => {
//     const engine = emblaApi.internalEngine();
//     setSlideIndices(engine.slideIndexes);
//     setSlideNodes(emblaApi.slideNodes());
//   }, [emblaApi, setSlideIndices, setSlideNodes]);

//   const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
//     setSelectedIndex(emblaApi.selectedScrollSnap())
//   }, [emblaApi, setSelectedIndex]);

//   useEffect(() => {
//     if (!emblaApi) return

//     onInit(emblaApi)
//     onSelect(emblaApi)

//     emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect)

//     return () => {
//       emblaApi.off('reInit', onInit).off('reInit', onSelect).off('select', onSelect);
//     }
//   }, [emblaApi, onInit, onSelect])

//   console.log({selectedIndex, slideNodes, slideIndices});

//   return {
//     selectedIndex,
//     onDotButtonClick,
//     slideNodes,
//     slideIndices
//   }
// }
