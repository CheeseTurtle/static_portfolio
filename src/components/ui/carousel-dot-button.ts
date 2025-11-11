import { cn } from "@/lib/utils";
import type {EmblaCarouselType} from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

type UseDotButtonType = {
  selectedIndex: number
  // scrollSnaps: number[]
  // scrollSnapList: number[]
  onDotButtonClick: (index: number) => void
  slideIndices: number[]
  slideNodes: HTMLElement[]
}

export const useDotButton = (
  emblaApi: EmblaCarouselType | undefined,
  onButtonClick?: (emblaApi: EmblaCarouselType) => void
): UseDotButtonType => {
  // const [_ref, emblaApi] = useEmblaCarousel();
  // if(!emblaApi) return;

  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  // const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  // const [scrollSnapList, setScrollSnapList] = useState<number[]>([])
  const [slideIndices, setSlideIndices] = useState<number[]>([])
  const [slideNodes, setSlideNodes] = useState<HTMLElement[]>([])

  const onDotButtonClick = useCallback(
    (index: number) => {
      // console.log('onDotButtonClick', emblaApi, index);
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      if (onButtonClick) onButtonClick(emblaApi);
    },
    [emblaApi, onButtonClick]
  )

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    // setScrollSnaps(emblaApi.scrollSnapList())
    const engine = emblaApi.internalEngine();
    // setScrollSnaps(engine.scrollSnaps);
    // setScrollSnapList(engine.scrollSnapList);
    setSlideIndices(engine.slideIndexes);
    setSlideNodes(emblaApi.slideNodes());
  }, [emblaApi, setSlideIndices, setSlideNodes]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)

    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect)

    return () => {
      emblaApi.off('reInit', onInit).off('reInit', onSelect).off('select', onSelect);
    }
  }, [emblaApi, onInit, onSelect])

  return {
    selectedIndex,
    onDotButtonClick,
    slideNodes: slideNodes,
    slideIndices
  }
}
