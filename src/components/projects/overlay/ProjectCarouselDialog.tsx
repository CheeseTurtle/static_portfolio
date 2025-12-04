import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useEffectEvent, useMemo, useRef, type MouseEventHandler, type PointerEventHandler, type ReactNode } from "react";
import type {EmblaCarouselType, EmblaOptionsType} from "embla-carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "./TransparentDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { XIcon } from "lucide-react";
import { useBrowserContext } from "../filtering/common/browserContext";
import { ShareButton } from "../grid/items/sharing/ShareCard";
import type { ScrollToFn, ShowToastFn } from "../filtering/common/filterTypes";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";

type CarouselContentItem = {
    children?: ReactNode[],
    props: {
        ['data-project-id']: string,
    }
} & ReactNode;

type ProjectCarouselProps = {
    contentElements: CarouselContentItem[],
    showToast: ShowToastFn,
    scrollTo: ScrollToFn,
} & React.ComponentProps<"div">;

export default function ProjectCarouselDialog({ contentElements, showToast, scrollTo }: ProjectCarouselProps) {
    // Get all state and actions from the store
    const open = useBrowserContext(s => s.carouselOpen);
    const setOpen = useBrowserContext(s => s.setCarouselOpen);
    const onOpenChange = useBrowserContext(s=>s.setCarouselOpen);
    const activeProjectIndex = useBrowserContext(s => s.activeProjectIndex);
    const setActiveProjectIndex = useBrowserContext(s => s.setActiveProjectIndex);
    const visibleProjects = useBrowserContext(s=>s.visibleProjects);
    
    const overlayRef = useRef<HTMLDivElement>(null);
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    // Embla setup
    const containerRef = useRef<HTMLDivElement>(null);

    const container = containerRef.current;
    const opts: EmblaOptionsType = useMemo(() => ({
        container: container ?? undefined,
    }), [container]);
    
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

    const clickCallback: PointerEventHandler = (evt)=>{
        evt.stopPropagation();
    }

    const slideElems = slides.map((slide, i) => (
        <CarouselItem key={i} id={`slide-${i}`} className="pointer-events-auto h-min">
            <Card className="relative w-full flex pointer-events-auto max-h-[calc(100vh-(--spacing(25)))] overflow-y-scroll">
                <CardHeader>
                    <CardTitle><div className="text-wrap mr-50">{visibleProjects[i].title}</div></CardTitle>
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
        </CarouselItem>
    ));

    const debouncedScrollTo = useDebounceCallback(scrollTo, 1000);

    // Handle carousel slide selection
    const onSelect = useCallback((emblaApi: EmblaCarouselType | undefined) => {
        if (!emblaApi) return;
        
        const index = emblaApi.selectedScrollSnap();
        console.log('[Carousel] onSelect - scrolling to index:', index, 'current activeIndex:', activeProjectIndex);
        
        const shouldScroll = index !== activeProjectIndex;

        // Update the store's active project index
        // This will trigger URL sync automatically if carousel is open
        setActiveProjectIndex(index);
    
        if(index !== activeProjectIndex)
            debouncedScrollTo(index, false);
    }, [setActiveProjectIndex, activeProjectIndex, debouncedScrollTo]);

    // Handle embla reinitialization
    const onEmblaReInit = useCallback((emblaApi: EmblaCarouselType | undefined) => {
        if (!emblaApi) return;
        
        // console.log('[Carousel] onReInit - activeIndex:', activeProjectIndex, 'embla snap:', emblaApi.selectedScrollSnap());
        
        if (activeProjectIndex !== null && open) {
            // console.log('[Carousel] (onReInit) Scrolling to index:', activeProjectIndex);
            emblaApi.scrollTo(activeProjectIndex, true);
            debouncedScrollTo.cancel(); 
            debouncedScrollTo(activeProjectIndex, true);
        }
    }, [activeProjectIndex, open, debouncedScrollTo]);

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


    const wasOpen = useRef<boolean>(false);
    const debouncedScrollTo_cancel = useEffectEvent(() => debouncedScrollTo.cancel());
    // Handle carousel open/close
    useEffect(() => {
        // console.log('[Carousel] open changed:', open, 'activeIndex:', activeProjectIndex, 'embla:', !!embla);
        if (!embla) return;
        if(!open && wasOpen.current) {
            // console.log('Cancelling debounced scrollTo');
            debouncedScrollTo_cancel(); // or flush?
        } else if (open && activeProjectIndex !== null) {
            // console.log('[Carousel] Opening - reInit and scroll to:', activeProjectIndex);
            if(!wasOpen.current) embla.reInit({ startIndex: activeProjectIndex });
            else embla.scrollTo(activeProjectIndex, false);
        }
        wasOpen.current = open;
    }, [open, embla, activeProjectIndex]);

    const noPropagate = (e: React.PointerEvent<HTMLButtonElement | HTMLDivElement>) => {
        e.stopPropagation();
    };

    const dialogOnClick: MouseEventHandler<HTMLDivElement> = React.useCallback((e) => {setOpen(false); e.preventDefault();}, [setOpen]);

    const onOpenChange_ = React.useCallback((open: boolean) => {
            console.log('Open changed:', open);
            onOpenChange(open);
            debouncedScrollTo.flush();
        }, [onOpenChange, debouncedScrollTo]);

    useEffect(()=>{

        const callback = (evt: KeyboardEvent) => {
            console.log('Key up:', evt);

        };
        window.addEventListener('keyup', callback);
        return () => { window.removeEventListener('keyup', callback) };
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange_} modal={true}>
            <DialogPortal container={document.getElementById('modal-root')}>
                <DialogContent 
                    className="border-0 shadow-none p-0 m-0 items-center justify-center focus:outline-none z-50 flex w-full h-full inset-0 pointer-events-none" 
                    aria-describedby={undefined}
                    showCloseButton={false}
                    // onKeyUp={(evt)=>{
                    //     console.log('Key up:', evt);
                    // }}
                >
                    <DialogOverlay 
                        id="carousel-dialog-overlay"
                        ref={overlayRef} 
                        className="fixed p-0 m-0 inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={dialogOnClick} 
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
                        <CarouselPrevious ref={prevRef} className='pointer-events-auto disabled:pointer-events-auto'/> 
                        <CarouselNext ref={nextRef} className='pointer-events-auto disabled:pointer-events-auto'/> 
                        <CarouselDots />
                    </Carousel>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}