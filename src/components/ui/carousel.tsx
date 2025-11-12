import * as React from "react"
import useEmblaCarousel, {
  type EmblaViewportRefType,
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import type {EmblaCarouselType, EmblaEventType, EmblaOptionsType} from "embla-carousel";

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]


const TWEEN_FACTOR_BASE = 0.84

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void,
  onCarouselSelect?: (api: CarouselApi | undefined) => void,
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
  // const containerRef = React.useRef<HTMLDivElement | null>(null);
  console.log('useEmblaCarousel with opts:', opts, props, externalApi, externalCarouselRef);
  // console.log()

  const [internalCarouselRef, internalApi] = useEmblaCarousel(
    externalApi ? undefined : { // Only initialize if no external api
      ...opts,
      axis: (orientation === "horizontal") ? "x" : "y",
    },
    externalApi ? undefined : plugins
  );

  const carouselRef = externalCarouselRef ?? internalCarouselRef;
  const api = externalApi ?? internalApi;
  
  // const [carouselRef, api] = (()=>{
  //   if(externalApi !== undefined && externalCarouselRef !== undefined)
  //     return [externalCarouselRef, externalApi];
  //   if(externalApi !== undefined || externalCarouselRef !== undefined)
  //     throw TypeError();

  //   return useEmblaCarousel(
  //     {
  //       ...opts,
  //       // container: '#embla-container',
  //       // container: containerRef,
  //       axis: (orientation === "horizontal") ? "x" : "y",
  //     },
  //     plugins
  //   );
  // })();

  React.useEffect(() => {
    console.log('(CAROUSEL) API:', api, carouselRef);
  }, [api, carouselRef]);

  const tweenFactor = React.useRef(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelectInInit = React.useCallback((api?: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    // onSelect_?.(api);
  }, [setCanScrollNext, setCanScrollPrev]);
  const onSelect = React.useCallback((api: CarouselApi) => {
    onSelectInInit(api);
    onSelect_?.(api);
  }, [onSelectInInit, onSelect_]);


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


  const setTweenFactor = React.useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])

  const tweenOpacity = React.useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine()
      const scrollProgress = emblaApi.scrollProgress()
      const slidesInView = emblaApi.slidesInView()
      const isScrollEvent = eventName === 'scroll'
      // console.log(emblaApi.scrollSnapList(), engine.scrollSnapList, engine.scrollSnaps, engine.slideIndexes, emblaApi.slideNodes())

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress
        const slidesInSnap = engine.slideRegistry[snapIndex]

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target()

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress)
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress)
                }
              }
            })
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
          const opacity = numberWithinRange(tweenValue, 0, 1).toString()
          // console.log(slideIndex, opacity)
          emblaApi.slideNodes()[slideIndex].style.opacity = opacity
        })
      })
    },
    []
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelectInInit(api)
    api.on("reInit", onSelectInInit)
    // api.on("select", onSelect)

    return () => {
      api?.off('reInit', onSelectInInit)
      // api?.off("select", onSelect)
    }
  }, [api, onSelectInInit]);

  React.useEffect(() => {
    if (!api) return
    // onSelect(api);
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])


  React.useEffect(() => {
    if (!api) return;

    setTweenFactor(api);
    tweenOpacity(api);
    api
      .on('reInit', setTweenFactor)
      .on('scroll', tweenOpacity)
      .on('reInit', tweenOpacity)
      .on('slideFocus', tweenOpacity);

    return () => {
      api
        .off('reInit', setTweenFactor)
      .off('scroll', tweenOpacity)
      .off('reInit', tweenOpacity)
      .off('slideFocus', tweenOpacity);
    }
  }, [api, tweenOpacity, setTweenFactor]);

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

  console.log('context value:', contextValue);

  return (
    <CarouselContext.Provider
      value={contextValue}
    >
      <div
        // ref={carouselRef}
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
  const obj = useCarousel()
  const { carouselRef, orientation, api }  = obj;

  React.useEffect(()=>{
    console.log('(CONTENT) API:', api, obj);
  }, [api, obj]);

  return (
    <div
    // className="overflow-hidden"
    // id="embla-container"
    data-slot="carousel-content"
    ref={carouselRef}
    {...props}
    //  <div
    //   ref={carouselRef}
    //   id="embla-container"
    className={cn(
      "flex",
      orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
      className
    )}
    // {/* {...props} */}
    // {/* /> */}
    >
      {children}
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const obj = useCarousel()
  const { orientation, api }  = obj;

  React.useEffect(()=>{
    console.log('(ITEM) API:', api, obj);
  }, [api, obj]);

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
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
  ...props
}: React.ComponentProps<typeof Button>) {
  const obj = useCarousel();
  const { orientation, scrollPrev, canScrollPrev } = obj;

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}




type CarouselDotButtonPropType = {selected: boolean} & React.ComponentPropsWithRef<'button'>;

// export const DotButton: React.FC<PropType> = (props) => {
function CarouselDotButton (props: CarouselDotButtonPropType) {
  const { children, selected, className, ...restProps } = props

  return (
    <button type="button" {...restProps} data-selected={selected} className={cn(
        "appearance-none bg-transparent touch-manipulation inline-flex cursor-pointer border-0 p-0 m-0",
        "w-[2.6rem] h-[2.6rem] flex items-center justify-center rounded-full",
        "tap-highlight-transparent", // you’ll need to define this yourself (see note below)
        "after:content-[''] after:flex after:items-center after:justify-center after:rounded-full",
        "after:w-[1.4rem] after:h-[1.4rem]",
        "after:shadow-[inset_0_0_0_0.2rem_rgb(234_234_234)]",
        "data-[selected=true]:after:shadow-[inset_0_0_0_0.2rem_var(--color-mint-50)]",
        (selected ? 'bg-accent-foreground' : ''),
        className
    )}>
      {children}
    </button>
  )
}


function CarouselDots() {

  // const obj = useCarousel();
  const obj = useCarousel();
  const {api} = obj;

  React.useEffect(()=>{
    console.log('(DOTS) API:', api, obj);
  }, [api, obj]);
  
  const { selectedIndex, slideIndices, onDotButtonClick } = useDotButton(api);

  return <div 
    data-role='carousel-dot-buttons' 
    // className="flex flex-wrap justify-end items-center mr-[calc((2.6rem-1.4rem)/(-2))]"
    className="flex w-full relative justify-items-center justify-center"
    >
    {slideIndices.map(index=>
      <CarouselDotButton
        key={index}
        onClick={() => onDotButtonClick(index)}
        selected={index === selectedIndex}
        />
    )}

  </div>
}



type UseDotButtonType = {
  selectedIndex: number
  // scrollSnaps: number[]
  // scrollSnapList: number[]
  onDotButtonClick: (index: number) => void
  slideIndices: number[]
  slideNodes: HTMLElement[],
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>,
  setSlideIndices: React.Dispatch<React.SetStateAction<number[]>>,
  setSlideNodes: React.Dispatch<React.SetStateAction<HTMLElement[]>>,
}

export const useDotButton = (
  emblaApi: EmblaCarouselType | undefined,
  onButtonClick?: (emblaApi: EmblaCarouselType) => void
): UseDotButtonType => {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0)
  const [slideIndices, setSlideIndices] = React.useState<number[]>([])
  const [slideNodes, setSlideNodes] = React.useState<HTMLElement[]>([])

  // const {api: emblaApi} = useCarousel();

  // console.log('EMBLA API:', emblaApi);

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

  console.log({selectedIndex, slideNodes, slideIndices});

  return {
    selectedIndex,
    onDotButtonClick,
    setSelectedIndex,
    setSlideIndices,
    setSlideNodes,
    slideNodes,
    slideIndices
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
