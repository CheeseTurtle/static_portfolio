import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useEffectEvent, useMemo, useRef, type MouseEventHandler, type ReactNode } from "react";
import type {EmblaCarouselType, EmblaOptionsType} from "embla-carousel";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "./TransparentDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useBrowserContext } from "../filtering/common/browserContext";
import type { ScrollToFn, ShowToastFn } from "../filtering/common/filterTypes";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import type { ProjectInfo } from "../types";
import type { ProjectInfoForProvider } from "../details/ProjectProvider";
// import ProjectCarousel from "./ProjectCarousel";

const ProjectCarousel = React.lazy(()=>import('./ProjectCarousel'));

export type CarouselContentItem = {
    children?: ReactNode[],
    props: {
        ['data-project-id']: string,
    }
} & ReactNode;

export type CarouselContentItemWithTitle = CarouselContentItem & {
    title: ProjectInfo['title'],
    project: ProjectInfoForProvider,
}

type ProjectCarouselDialogProps = {
    contentElements: CarouselContentItem[],
    showToast: ShowToastFn,
    scrollTo: ScrollToFn,
} & React.ComponentProps<"div">;



const HovercardContentItem = ({project, index, numSlides}: {project: ProjectInfo, index: number, numSlides: number}) => {
    const indexSpan = useMemo(()=><span><span>{index}</span>/<span>{numSlides}</span></span>, [index, numSlides]);
    return <div className="w-full outline-2 outline-green-500">
        <div className="text-center w-full text-xs font-normal tabular-nums">{indexSpan}</div>
        <div className="w-full text-sm font-extrabold">{project.title}</div>
        <p className="text-xs font-light">{project.description}</p>
    </div>
}

export default function ProjectCarouselDialog({ contentElements, showToast, scrollTo }: ProjectCarouselDialogProps) {
    // Get all state and actions from the store
    const open = useBrowserContext(s => s.carouselOpen);
    const setOpen = useBrowserContext(s => s.setCarouselOpen);
    const onOpenChange = useBrowserContext(s=>s.setCarouselOpen);
    const activeProjectIndex = useBrowserContext(s => s.activeProjectIndex);
    const setActiveProjectIndex = useBrowserContext(s => s.setActiveProjectIndex);
    const visibleProjects = useBrowserContext(s=>s.visibleProjects);

    const overlayRef = useRef<HTMLDivElement>(null);
    // const prevRef = useRef<HTMLButtonElement>(null);
    // const nextRef = useRef<HTMLButtonElement>(null);

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
        () => visibleProjects.map((p) => Object.assign({title: p.title, project: p}, allSlides[p.id])), 
        [visibleProjects, allSlides]
    );

    const numSlides = useMemo(()=>visibleProjects.length, [visibleProjects]);

    const getHovercardContentForIndex = React.useCallback((index: number) => {
        const project = visibleProjects[index];
        if(!project) return null;
        return <HovercardContentItem project={project} numSlides={numSlides} index={index} />;
    }, [visibleProjects, numSlides]);

    const debouncedScrollTo = useDebounceCallback(scrollTo, 1000);

    // Handle carousel slide selection
    const onSelect = useCallback((emblaApi: EmblaCarouselType | undefined) => {
        if (!emblaApi) return;
        
        const index = emblaApi.selectedScrollSnap();
        // console.log('[Carousel] onSelect - scrolling to index:', index, 'current activeIndex:', activeProjectIndex);

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

    const dialogOnClick: MouseEventHandler<HTMLDivElement> = React.useCallback((e) => {
        setOpen(false); e.preventDefault();}, [setOpen]);

    const onOpenChange_ = React.useCallback((open: boolean) => {
            console.log('Open changed:', open);
            onOpenChange(open);
            debouncedScrollTo.flush();
        }, [onOpenChange, debouncedScrollTo]);

    useEffect(()=>{
        if(!embla) return;

        const callback = (evt: KeyboardEvent) => {
            // console.log('Key up/down:', evt);
            switch(evt.key) {
                case 'ArrowLeft': {
                    if(embla.canScrollPrev())
                        embla.scrollPrev(false);
                    break;
                }
                case 'ArrowRight': {
                    if(embla.canScrollNext())
                        embla.scrollNext(false);
                    break;
                }
                default: 
                    return;
                }
            evt.preventDefault();
            // evt.stopImmediatePropagation();
            evt.stopPropagation();
        };
        // window.addEventListener('keydown', callback);
        window.addEventListener('keyup', callback);
        return () => { 
            // window.removeEventListener('keydown', callback);
            window.removeEventListener('keyup', callback) 
        };
        
    });

    return (
        <React.Suspense fallback={<div className="z-50 absolute w-screen h-screen bg-red-500">Turtles</div>}>
            <Dialog open={open} onOpenChange={onOpenChange_} modal={true}>
                <DialogPortal container={document.getElementById('modal-root')}>
                    <DialogContent 
                        className="border-0 shadow-none p-0 m-0 items-center justify-center focus:outline-none z-50 flex w-full h-full inset-0 pointer-events-none overflow-clip" 
                        aria-describedby={undefined}
                        showCloseButton={false}
                        style={{contentVisibility: 'auto'}}
                        // onKeyUp={(evt)=>{
                            //     console.log('Key up:', evt);
                            // }}
                            >
                        <React.Suspense fallback={<div className="w-full h-full bg-orange-400">Turtles</div>}>
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
                            <React.Suspense fallback={<div className="w-full h-full bg-yellow-300">Turtles</div>}>
                                <ProjectCarousel ref={emblaRef} slides={slides} onCarouselSelect={onSelect} externalApi={embla} showToast={showToast} getHovercardContentForIndex={getHovercardContentForIndex}/>
                            </React.Suspense>
                        </React.Suspense>
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </React.Suspense>
    );
}