import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { type EmblaViewportRefType } from "embla-carousel-react";
import React, { type PointerEventHandler } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogClose } from "./TransparentDialog";
import { XIcon } from "lucide-react";
import { ShareButton } from "../grid/items/sharing/ShareCard";
import type { ShowToastFn } from "../filtering/common/filterTypes";
import type { CarouselContentItemWithTitle } from "./ProjectCarouselDialog";
import { Skeleton } from "@/components/ui/skeleton";

type ProjectCarouselProps = Omit<React.ComponentProps<typeof Carousel>, 'externalCarouselRef'> & {
    ref?: EmblaViewportRefType,
    // slideElems: React.JSX.Element[],
    slides: CarouselContentItemWithTitle[],
    prevRef?: React.RefObject<HTMLButtonElement | null>,
    nextRef?: React.RefObject<HTMLButtonElement | null>,
    onCarouselSelect: (emblaApi?: EmblaCarouselType) => void,
    externalApi?: EmblaCarouselType,
    showToast: ShowToastFn
}



type ProjectCarouselItemHandle = {
    setIsCurrent: (isCurrent: boolean) => void,
}

type ProjectCarouselItemProps = React.ComponentProps<typeof CarouselItem> & {
    index: number,
    slide: CarouselContentItemWithTitle,
    // isCurrentItem: boolean,
    onPointerDown: PointerEventHandler,
    showToast: ShowToastFn,
    handleRef?: React.RefObject<ProjectCarouselItemHandle>,
    startTransition: ReturnType<typeof React.useTransition>[1]
}

const CarouselSlideContentSkeleton = React.memo(()=>{
    return (
        <div>
            <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
});


const ProjectCarouselItem = React.memo(({ handleRef, startTransition, index: i, slide, onPointerDown: clickCallback, showToast, ...props }: ProjectCarouselItemProps) => {
    // const isCurrent = React.useDeferredValue<boolean>(isCurrentItem);
    const skeleton = React.useMemo(()=><CarouselSlideContentSkeleton/>, []);
    const [isCurrentItem, setIsCurrentItem] = React.useState<boolean>(false);

    // const setIsCurrent = React.useCallback((isCurrent: boolean) => {
    //     startTransition(()=>{
    //         setIsCurrentItem(isCurrent);
    //     });
    // }, [startTransition]);

    React.useImperativeHandle(handleRef, ()=>({
        setIsCurrent: setIsCurrentItem
    }), []);

    return <CarouselItem key={i} id={`slide-${i}`} className="pointer-events-auto h-min" {...props}>
        <Card className="relative w-full flex pointer-events-auto max-h-[calc(100vh-(--spacing(25)))] overflow-y-scroll">
            <CardHeader className="">
                <CardTitle>
                    <div className="text-wrap mr-50">
                        {slide.title}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pointer-events-auto" onPointerDown={clickCallback}>
                <DialogClose data-slot="dialog-close"
                    className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"><XIcon></XIcon></DialogClose>
                <ShareButton className="absolute right-12 top-3" showToast={showToast} openProjectId={slide.props["data-project-id"]} />    

                {/* accessible close: give button an explicit aria-label */}
                {/* <DialogClose aria-label="Close carousel" data-slot="dialog-close" className="sr-only" /> */}
                {/* above sr-only DialogClose is a compact additional accessible control -- main visual close still has icon */}
                {/* <ShareButton className="absolute top-4 right-14 text-sm" showToast={showToast} openProjectId={slide.props["data-project-id"]} /> */}
                {/* <React.Suspense>
                    {slide}
                </React.Suspense> */}
                {/* {isCurrentItem ? slide : skeleton} */}
                {slide}
            </CardContent>
        </Card>
    </CarouselItem>;
});


const clickCallback: PointerEventHandler = (evt) => evt.stopPropagation();
const ProjectCarousel = React.memo(({
    ref: emblaRef,
    externalApi: embla,
    opts,
    onCarouselSelect: onSelect,
    slides,
    prevRef,
    nextRef,
    showToast
}: ProjectCarouselProps) => {
    const slideHandles = React.useRef<Record<string, React.RefObject<ProjectCarouselItemHandle>>>({});
    slideHandles.current = Object.fromEntries(slides.map((slide) => [slide.props["data-project-id"], slideHandles.current[slide.props['data-project-id'] ?? React.createRef()]]));
    const [_isPending, startTransition] = React.useTransition();

    const slideElems = React.useMemo(()=>{
        return slides.map((slide, i) => (
            <ProjectCarouselItem handleRef={slideHandles.current[slide.props["data-project-id"]]} startTransition={startTransition} index={i} slide={slide} showToast={showToast} onPointerDown={clickCallback}></ProjectCarouselItem>
        ))
    }, [slides, showToast]);


    // const onSelect0: typeof onSelect = React.useCallback((api) => {
    //     // if(api) {
    //     //     const index = api.selectedScrollSnap();
    //     //     const prevIndex = api.previousScrollSnap();

    //     //     const currId = slides[index]?.props['data-project-id'];
    //     //     const currHandle = currId ? slideHandles.current[currId] : undefined;

    //     //     if(currHandle) {
    //     //         const prevId = slides[prevIndex]?.props['data-project-id'];
    //     //         const prevHandle = (prevIndex === index || !prevId) ? undefined : slideHandles.current[prevId];
    //     //         console.log(currHandle, prevHandle);
    //     //         React.startTransition(()=>{
    //     //             try {
    //     //                 prevHandle?.current?.setIsCurrent(false);
    //     //             } finally {
    //     //                 currHandle?.current?.setIsCurrent(true);
    //     //             }
    //     //         });
    //     //     }
    //     // }
    // }, [slides]);

    // const onSelect_: typeof onSelect = React.useCallback(api=>{
    //     try {
    //         onSelect0(api);
    //     } finally {
    //         // startTransition(()=>onSelect(api));
    //         onSelect(api);
    //     }
    // }, [onSelect, onSelect0]);

    return <Carousel
        ref={emblaRef}
        externalCarouselRef={emblaRef}
        externalApi={embla}
        opts={opts}
        className="overflow-visible z-60 w-full max-w-2xl pointer-events-none"
        onCarouselSelect={onSelect}
    >
        <CarouselContent
            id="embla-container"
            className="overflow-visible pointer-events-none w-full items-center max-h-[calc(100%-(--spacing(20)))] ml-auto mr-auto max-w-[calc(100%-(--spacing(20)))]"
            style={{
                willChange: 'transform',
                transform: 'translateZ(0)'
            }}
        >
            {...slideElems}
        </CarouselContent>
        <CarouselPrevious ref={prevRef} size="lg" className='pointer-events-auto disabled:pointer-events-auto not-disabled:cursor-pointer disabled:cursor-not-allowed max-md:hidden' />
        <CarouselNext ref={nextRef} className='pointer-events-auto disabled:pointer-events-auto max-md:hidden not-disabled:cursor-pointer disabled:cursor-not-allowed' />
        <CarouselDots />
    </Carousel>;
});

export default ProjectCarousel;