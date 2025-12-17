import * as React from "react"
import useEmblaCarousel, {
  type EmblaViewportRefType,
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import type {EmblaCarouselType, EmblaEventType, /*EmblaEventType*/ } from "embla-carousel";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"
import CarouselSlider from "../projects/overlay/CarouselSlider"
import { useResizeObserver } from "@/hooks/useResizeObserver"
import useThrottledDebounce from "@/hooks/useThrottledDebounce"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void,
  onCarouselSelect?: (api: CarouselApi | undefined, evtType?: EmblaEventType) => void,
  externalApi?: CarouselApi,
  externalCarouselRef?: EmblaViewportRefType
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({ orientation = "horizontal",
  externalApi, externalCarouselRef,
  opts, setApi, plugins, className, children, onCarouselSelect: onSelect_,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {

  const [internalCarouselRef, internalApi] = useEmblaCarousel(
    externalApi ? undefined : { // Only initialize if no external api
      ...opts,
      axis: (orientation === "horizontal") ? "x" : "y",
    },
    externalApi ? undefined : plugins
  );

  const carouselRef = externalCarouselRef ?? internalCarouselRef;
  const api = externalApi ?? internalApi;
  
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi | undefined, evtType?: EmblaEventType) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    onSelect_?.(api, evtType);
  }, [setCanScrollNext, setCanScrollPrev, onSelect_]);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off('reInit', onSelect)
      api?.off("select", onSelect)
    }
  }, [api, onSelect]);


  const contextValue: CarouselContextProps = React.useMemo(() => ({
    carouselRef,
    api,
    setApi,
    plugins,
    opts,
    orientation:
      orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
  }), [carouselRef, api, opts, orientation, scrollPrev, scrollNext, canScrollNext, canScrollPrev, setApi, plugins]);

  return (
    <CarouselContext.Provider
      value={contextValue}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ children, className, ...props }: React.ComponentProps<"div">) {
  // const { orientation, api } = useCarousel();
  const {carouselRef, orientation } = useCarousel()

  return (
    <div
    data-slot="carousel-content"
    ref={carouselRef}
    {...props}
    className={cn(
      "flex",
      orientation === 'horizontal' ? '' : 'flex-col',
      className
    )}
    >
      {children}
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "embla__slide",
        "min-w-0 shrink-0 grow-0 basis-full",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ref,
  ...props
}: React.ComponentProps<typeof Button>) {
  const obj = useCarousel();
  const { orientation, scrollPrev, canScrollPrev } = obj;

  return (
    <div className={cn(
      "absolute size-8 rounded-full",
      "cursor-pointer has-disabled:cursor-not-allowed",
      orientation === "horizontal"
            ? "top-1/2 -left-12 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
      className,
      "bg-none border-none ring-none shadow-none outline-none",
    )}>
      <Button
        data-slot="carousel-previous"
        variant={variant}
        size={size}
        ref={ref}
        className={cn(
          "relative w-full h-full rounded-full size-8",
          "not-disabled:cursor-pointer",
          "disabled:cursor-not-allowed",
          className
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft />
        <span className="sr-only">Previous slide</span>
      </Button>
    </div>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ref,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <div className={cn(
      "absolute size-8 rounded-full",
      "cursor-pointer has-disabled:cursor-not-allowed",
      orientation === "horizontal"
        ? "top-1/2 -right-12 -translate-y-1/2"
        : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
      className,
      "bg-none border-none ring-none shadow-none outline-none"
    )}>
      <Button
        data-slot="carousel-next"
        variant={variant}
        size={size}
        ref={ref}
        className={cn(
          "relative w-full h-full rounded-full size-8",
          "not-disabled:cursor-pointer",
          "disabled:cursor-not-allowed",
          className
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight />
        <span className="sr-only">Next slide</span>
      </Button>
    </div>
  )
}


const CarouselDotButtonHovercard = React.memo(({hovercardContent, isHovered, onHover, onUnhover, button}: {hovercardContent: React.ReactNode, isHovered: boolean, onHover: ()=>void, onUnhover: ()=>void, button: React.JSX.Element})=>{
  return hovercardContent ? <HoverCard open={isHovered} defaultOpen={false}>
      <HoverCardTrigger asChild onPointerOver={onHover} onPointerOut={onUnhover}>{button}</HoverCardTrigger>
      <HoverCardContent>{hovercardContent}</HoverCardContent>
    </HoverCard> : button;
});

type CarouselDotButtonPropType = {onButtonClick: (index: number, evt: React.MouseEvent<HTMLButtonElement>) => void, hoverIndex: number | undefined, setHoverIndex: (index: number | undefined) => void, clearHoverIndex: ()=>void, index: number, selected: boolean, getHovercardContentForIndex: (index: number)=>React.ReactNode} & React.ComponentPropsWithRef<'button'>;

const CarouselDotButton = React.memo(({onButtonClick, onClick, getHovercardContentForIndex, hoverIndex, setHoverIndex, clearHoverIndex, children, className, index, selected, ...props}: CarouselDotButtonPropType) => {

  const isHovered = React.useMemo(()=>hoverIndex===index, [hoverIndex, index]);

  const onClick_: React.MouseEventHandler<HTMLButtonElement> = React.useCallback((evt)=>{
    onButtonClick(index, evt);
    onClick?.(evt)
  }, [index, onClick, onButtonClick])

  const button =
    <button type="button" onClick={onClick_} {...props} data-selected={selected} className={cn(
        "appearance-none bg-transparent touch-manipulation inline-flex cursor-pointer border-0 p-0 m-0",
        "w-[2.6rem] h-[2.6rem] flex items-center justify-center rounded-full",
        "tap-highlight-transparent", // you’ll need to define this yourself (see note below)
        "after:content-[''] after:flex after:items-center after:justify-center after:rounded-full",
        "after:w-[1.4rem] after:h-[1.4rem]",
        "dark:after:shadow-[inset_0_0_0_0.2rem_rgb(234_234_234)]",
        "dark:data-[selected=true]:after:shadow-[inset_0_0_0_0.2rem_var(--color-mint-50)]",
        "after:shadow-[inset_0_0_0_0.2rem_rgb(234_234_234)]",
        "data-[selected=true]:after:shadow-[inset_0_0_0_0.2rem_var(--color-mint-50)]",
        (selected ? 'bg-accent dark:bg-accent-foreground' : ''),
        className
    )}>
      {children}
    </button>;

    const hovercardContent = React.useMemo(()=>getHovercardContentForIndex(index), [index, getHovercardContentForIndex]);

    const onHover = React.useCallback(()=>setHoverIndex(index), [setHoverIndex, index]);
    const onUnhover = React.useCallback(clearHoverIndex, [clearHoverIndex]);
    return <CarouselDotButtonHovercard hovercardContent={hovercardContent} button={button} onHover={onHover} onUnhover={onUnhover} isHovered={isHovered}/>
});


function CarouselDots({getHovercardContentForIndex}: {getHovercardContentForIndex: (index: number)=>React.ReactNode}) {

  const {api} = useCarousel();
  
  const { selectedIndex, slideIndices, onDotButtonClick, hoveredIndex, setHoveredIndex } = useDotButton(api);

  const setHoveredIndexDeferred = useThrottledDebounce(setHoveredIndex, 150, 250);

  const clearHoverIndex = React.useCallback(()=>setHoveredIndexDeferred(undefined), [setHoveredIndexDeferred]);


  return <div 
    data-role='carousel-dot-buttons' 
    // className="flex flex-wrap justify-end items-center mr-[calc((2.6rem-1.4rem)/(-2))]"
    className="flex w-full relative justify-items-center justify-center pointer-events-auto"
    >
    {slideIndices.map(index=>
      <CarouselDotButton
        key={index}
        onButtonClick={onDotButtonClick}
        selected={index === selectedIndex}
        getHovercardContentForIndex={getHovercardContentForIndex}
        index={index}
        setHoverIndex={setHoveredIndexDeferred}
        clearHoverIndex={clearHoverIndex}
        hoverIndex={hoveredIndex}
        />
    )}

  </div>
}

export function CarouselNav({getHovercardContentForIndex, className}: {getHovercardContentForIndex: (index: number)=>React.ReactNode, className?: string, }) {
  
  const {api} = useCarousel();
  
  const { selectedIndex, slideIndices, onDotButtonClick, hoveredIndex, setHoveredIndex } = useDotButton(api);

  const [useSlider, setUseSlider] = React.useState<boolean>(false);
  
  const numSlides = React.useMemo(()=>slideIndices.length, [slideIndices]);

  const navRef = React.useRef<HTMLDivElement>(null);

  const lastWidth = React.useRef<number | undefined>(undefined);

  const handleResize = React.useCallback((width: number, _el: Element)=>{
    const computed = getComputedStyle(document.documentElement);
    const rem = parseFloat(computed.fontSize);
    const minWidthForDots = numSlides * 1.6 * rem;
    setUseSlider(width < minWidthForDots);
    lastWidth.current = width;
  }, [numSlides]);

  const options: Parameters<typeof useResizeObserver>[0] = React.useMemo(()=>({
    ref: navRef,
    onResize(entry) {
      const width = entry.contentRect.width;
      if(width === lastWidth.current) return;
      handleResize(width, entry.target);
    },
    debounce: 500,
    throttle: 300,
    // enabled: true
  }), [handleResize]);
  useResizeObserver(options);

  const handleResize_ = React.useEffectEvent(handleResize);
  React.useLayoutEffect(()=>{
    if(lastWidth.current === undefined) return;
    if(!navRef.current) return;
    // if(lastWidth.current === navRef.current.clientWidth) return;
    handleResize_(navRef.current.clientWidth || lastWidth.current, navRef.current);
  }, [numSlides]);
  
  

  const setHoveredIndexDeferred = useThrottledDebounce(setHoveredIndex, 150, 250);

  const clearHoverIndex = React.useCallback(()=>setHoveredIndexDeferred(undefined), [setHoveredIndexDeferred]);

  const onValueChange = React.useCallback(([value]: [number])=>onDotButtonClick(value), [onDotButtonClick]);

  return <div 
    ref={navRef}
  // className="flex flex-wrap justify-end items-center mr-[calc((2.6rem-1.4rem)/(-2))]"
  className={className}
  >
      {!useSlider && <div className={
        cn('flex',
        useSlider ? 'hidden' : 'visible'
      )}
        data-role='carousel-dot-buttons w-full flex relative justify-items-center justify-center pointer-events-auto
          hover:bg-blue-500
        ' 
      >
        {slideIndices.map(index=>
          <CarouselDotButton
            key={index}
            onButtonClick={onDotButtonClick}
            selected={index === selectedIndex}
            index={index}
            getHovercardContentForIndex={getHovercardContentForIndex}
            setHoverIndex={setHoveredIndexDeferred}
            hoverIndex={hoveredIndex}
            clearHoverIndex={clearHoverIndex}
            />
        )}
      </div>}
      
      {useSlider && <div className={cn('flex',
        useSlider ? 'visible' : 'hidden'
      )} data-role='carousel-slider h-[2.6rem]'>
        <CarouselSlider  className="pointer-events-auto py-[1.4rem]" defaultValue={[selectedIndex]} onValueChange={onValueChange} getHovercardContentForIndex={getHovercardContentForIndex} numSlides={slideIndices.length} />
      </div>}

  </div> 
}

export const useDotButton = (
  emblaApi: EmblaCarouselType | undefined,
  onButtonClick?: (emblaApi: EmblaCarouselType) => void,
) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0)
  const [hoveredIndex, setHoveredIndex] = React.useState<number|undefined>(undefined);
  const [slideIndices, setSlideIndices] = React.useState<number[]>([])
  const [slideNodes, setSlideNodes] = React.useState<HTMLElement[]>([])

  const onDotButtonClick = React.useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      onButtonClick?.(emblaApi);
    },
    [emblaApi, onButtonClick]
  )

  const onInit = React.useCallback((emblaApi: EmblaCarouselType) => {
    const engine = emblaApi.internalEngine();
    setSlideIndices(engine.slideIndexes);
    setSlideNodes(emblaApi.slideNodes());
  }, [setSlideIndices, setSlideNodes]);

  const onSelect = React.useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [setSelectedIndex]);

  React.useEffect(() => {
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
    setSelectedIndex,
    setSlideIndices,
    setSlideNodes,
    slideNodes,
    slideIndices,
    hoveredIndex,
    setHoveredIndex,
  }
}


export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots
}
