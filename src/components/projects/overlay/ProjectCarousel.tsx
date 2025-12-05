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


type ProjectCarouselItemProps = React.ComponentProps<typeof CarouselItem> & {
    index: number,
    slide: CarouselContentItemWithTitle,
    onPointerDown: PointerEventHandler,
    showToast: ShowToastFn,
}
const ProjectCarouselItem = React.memo(({ index: i, slide, onPointerDown: clickCallback, showToast, ...props }: ProjectCarouselItemProps) => {
    return <CarouselItem key={i} id={`slide-${i}`} className="pointer-events-auto h-min" {...props}>
        <Card className="relative w-full flex pointer-events-auto max-h-[calc(100vh-(--spacing(25)))] overflow-y-scroll">
            <CardHeader>
                <CardTitle><div className="text-wrap mr-50">{slide.title}</div></CardTitle>
            </CardHeader>
            <CardContent className="pointer-events-auto" onPointerDown={clickCallback}>
                <DialogClose data-slot="dialog-close"
                    className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"><XIcon></XIcon></DialogClose>
                {/* accessible close: give button an explicit aria-label */}
                {/* <DialogClose aria-label="Close carousel" data-slot="dialog-close" className="sr-only" /> */}
                {/* above sr-only DialogClose is a compact additional accessible control — main visual close still has icon */}
                <ShareButton className="absolute top-4 right-14 text-sm" showToast={showToast} openProjectId={slide.props["data-project-id"]}></ShareButton>
                {slide}
            </CardContent>
        </Card>
    </CarouselItem>;
});

export default function ProjectCarousel({
    ref: emblaRef,
    externalApi: embla,
    opts,
    onCarouselSelect: onSelect,
    // slideElems,
    slides,
    // contentElements,
    prevRef,
    nextRef,
    showToast
}: ProjectCarouselProps) {
    const clickCallback: PointerEventHandler = (evt) => evt.stopPropagation();
    const slideElems = slides.map((slide, i) => (
        <ProjectCarouselItem index={i} slide={slide} showToast={showToast} onPointerDown={clickCallback}></ProjectCarouselItem>
    ));

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
            className="overflow-visible pointer-events-none w-full items-center max-h-[calc(100%-(--spacing(20)))] ml-auto mr-auto max-w-[calc(100%-(--spacing(12)))]"
            style={{
                willChange: 'transform',
                transform: 'translateZ(0)'
            }}
        >
            {...slideElems}
        </CarouselContent>
        <CarouselPrevious ref={prevRef} className='pointer-events-auto disabled:pointer-events-auto' />
        <CarouselNext ref={nextRef} className='pointer-events-auto disabled:pointer-events-auto' />
        <CarouselDots />
    </Carousel>;
}