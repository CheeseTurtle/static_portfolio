import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {EmblaCarouselType, EmblaOptionsType} from "embla-carousel";
import { createPortal } from "react-dom";
import type { ProjectInfo } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gsap } from 'gsap';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "./TransparentDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { XIcon } from "lucide-react";
import { useBrowserContext } from "../filtering/common/browserContext";

type CarouselContentItem = {
    children?: ReactNode[],
    props: {
        ['data-project-id']: string,
    }
} & ReactNode;

type ProjectCarouselProps = {
    contentElements: CarouselContentItem[];
} & React.ComponentProps<"div">;

export default function ProjectCarouselDialog({ contentElements }: ProjectCarouselProps) {
    // Get all state and actions from the store
    const open = useBrowserContext(s => s.carouselOpen);
    const setOpen = useBrowserContext(s => s.setCarouselOpen);
    const onOpenChange = useBrowserContext(s=>s.onCarouselOpenChange);
    const activeProjectIndex = useBrowserContext(s => s.activeProjectIndex);
    const setActiveProjectIndex = useBrowserContext(s => s.setActiveProjectIndex);
    // const visibleProjects = useBrowserContext(s => Array.from(s.visibleProjects.values()));
    const visibleProjects = useBrowserContext(s=>s.visibleProjects);
    
    const overlayRef = useRef<HTMLDivElement>(null);
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    // Embla setup
    const containerRef = useRef<HTMLDivElement>(null);
    const opts: EmblaOptionsType = useMemo(() => ({
        container: containerRef.current ?? undefined,
    }), [containerRef.current]);
    
    const [emblaRef, embla] = useEmblaCarousel(opts);

    // Map content elements by project ID
    const allSlides = useMemo(
        () => Object.fromEntries(contentElements.map(elem => [elem.props["data-project-id"], elem])), 
        [contentElements]
    );

    // Get slides for visible projects
    const slides = useMemo(
        () => visibleProjects.map((p) => allSlides[p.id]), 
        [visibleProjects, allSlides]
    );

    const slideElems = slides.map((slide, i) => (
        <CarouselItem key={i} id={`slide-${i}`} className="pointer-events-visible">
            <Card className="relative w-full flex pointer-events-visible">
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent className="pointer-events-visible">
                    {slide}
                </CardContent>
            </Card>
        </CarouselItem>
    ));

    // Handle carousel slide selection
    const onSelect = useCallback((emblaApi: EmblaCarouselType | undefined) => {
        if (!emblaApi) return;
        
        const index = emblaApi.selectedScrollSnap();
        console.log('[Carousel] onSelect - scrolling to index:', index, 'current activeIndex:', activeProjectIndex);
        
        // Update the store's active project index
        // This will trigger URL sync automatically if carousel is open
        setActiveProjectIndex(index);
    }, [setActiveProjectIndex, activeProjectIndex]);

    // Handle embla reinitialization
    const onEmblaReInit = useCallback((emblaApi: EmblaCarouselType | undefined) => {
        if (!emblaApi) return;
        
        console.log('[Carousel] onReInit - activeIndex:', activeProjectIndex, 'embla snap:', emblaApi.selectedScrollSnap());
        
        if (activeProjectIndex !== null && open) {
            console.log('[Carousel] (onReInit) Scrolling to index:', activeProjectIndex);
            emblaApi.scrollTo(activeProjectIndex, false);
        }
    }, [activeProjectIndex, open]);

    // Subscribe to embla events
    useEffect(() => {
        if (!embla) return;
        
        embla.on('reInit', onEmblaReInit);
        embla.on('select', onSelect);
        
        return () => { 
            embla
                .off('reInit', onEmblaReInit)
                .off('select', onSelect);
        };
    }, [embla, onEmblaReInit, onSelect]);

    // Handle carousel open/close
    // useEffect(() => {
    //     console.log('[Carousel] open changed:', open, 'activeIndex:', activeProjectIndex, 'embla:', !!embla);
        
    //     if (!embla) return;
        
    //     if (open && activeProjectIndex !== null) {
    //         console.log('[Carousel] Opening - reInit and scroll to:', activeProjectIndex);
    //         embla.reInit({ startIndex: activeProjectIndex });
    //         embla.scrollTo(activeProjectIndex, true);
    //     }
    // }, [open, embla, activeProjectIndex]);

    // Handle options changes
    const handleOptionsChanged = useCallback((embla: EmblaCarouselType | undefined, options: EmblaOptionsType) => {
        embla?.reInit(options);
    }, []);

    useEffect(() => {
        handleOptionsChanged(embla, opts);
    }, [embla, opts, handleOptionsChanged]);

    const noPropagate = (e: React.PointerEvent<HTMLButtonElement | HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogPortal container={document.getElementById('modal-root')}>
                <DialogContent 
                    className="border-0 shadow-none p-0 m-0 items-center justify-center focus:outline-none z-50 flex w-full h-full inset-0 pointer-events-none" 
                    aria-describedby={undefined}
                >
                    <DialogOverlay 
                        ref={overlayRef} 
                        className="fixed p-0 m-0 inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)} 
                        onPointerDownCapture={noPropagate} 
                        onPointerDown={noPropagate}
                    />
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>Project Carousel</DialogTitle>
                        </DialogHeader>
                    </VisuallyHidden>
                    
                    <Carousel 
                        ref={emblaRef} 
                        externalCarouselRef={emblaRef} 
                        externalApi={embla} 
                        opts={opts} 
                        className="overflow-visible z-60 pointer-events-auto w-full max-w-2xl"
                        onCarouselSelect={onSelect}
                    >
                        <CarouselContent 
                            id="embla-container" 
                            className="overflow-visible pointer-events-visible w-full"
                        >
                            {...slideElems}
                        </CarouselContent>
                        <CarouselPrevious ref={prevRef} className='disabled:pointer-events-auto'/> 
                        <CarouselNext ref={nextRef} className='disabled:pointer-events-auto'/> 
                        <CarouselDots />
                    </Carousel>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}