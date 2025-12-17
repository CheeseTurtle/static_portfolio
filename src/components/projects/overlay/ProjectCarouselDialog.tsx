import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useEffectEvent, useMemo, useRef, type MouseEventHandler, type ReactNode } from "react";
import type {EmblaCarouselType, EmblaOptionsType} from "embla-carousel";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "./TransparentDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useBrowserContext, useBrowserStore } from "../filtering/common/browserContext";
import type { ScrollToFn, ShowToastFn } from "../filtering/common/filterTypes";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import type { ProjectInfo } from "../types";
import type { ProjectInfoForProvider } from "../details/ProjectProviderBase";
import { useAnimationFrameRequest } from "@/hooks/useCallbackRequest";
import useThrottledDebounce from "@/hooks/useThrottledDebounce";
import { CustomSpinner } from "@/components/ui/CustomSpinner";
import { LucideTurtle } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useStore } from "zustand";
// import useSyncedRef from "@/hooks/useSyncedRef";
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


const CarouselFallback = React.memo(({className, ...props}: React.ComponentPropsWithRef<'div'>) => {
    

    return <div {...props} className={cn("z-75 pointer-events-none")}>
        <CustomSpinner Icon={LucideTurtle}/>
    </div>
});


export default function ProjectCarouselDialog({ contentElements, showToast, scrollTo }: ProjectCarouselDialogProps) {
    // Get all state and actions from the store
    const open = useBrowserContext(s => s.carouselOpen);
    const setOpen = useBrowserContext(s => s.setCarouselOpen);
    const onOpenChange = useBrowserContext(s=>s.setCarouselOpen);
    const activeProjectIndex = useBrowserContext(s => s.activeProjectIndex);
    const setActiveProjectIndex = useBrowserContext(s => s.setActiveProjectIndex);
    const visibleProjects = useBrowserContext(s=>s.visibleProjects);

    const [carouselProjectIndex, setCarouselProjectIndex] = React.useState<number | null>(activeProjectIndex);

    const overlayRef = useRef<HTMLDivElement>(null);
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    // Embla setup
    const containerRef = useRef<HTMLDivElement>(null);
    const container = containerRef.current;
    const opts: EmblaOptionsType = useMemo(() => ({
        container: container ?? undefined,
        duration: 20,
        watchFocus: false,
    }), [container]);
    
    const [emblaRef, embla] = useEmblaCarousel(opts);

    const notVisibleSlides = React.useRef<Set<number>>(new Set());
    const visibleSlides = React.useRef<Set<number>>(new Set());
    const newlyVisibleSlides = React.useRef<Set<number>>(new Set());
    const newlyNotVisibleSlides = React.useRef<Set<number>>(new Set());

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
    
    const alreadyOpenRef = React.useRef<boolean>(false); // or open?


    const getHovercardContentForIndex = React.useCallback((index: number) => {
        const project = visibleProjects[index];
        if(!project) return null;
        return <HovercardContentItem project={project} numSlides={numSlides} index={index} />;
    }, [visibleProjects, numSlides]);

    const debouncedScrollTo = useDebounceCallback(scrollTo, 1000);

    const debouncedSetActiveProjectIndex = useDebounceCallback(setActiveProjectIndex, 750);
    const debouncedSetCarouselProjectIndex = useDebounceCallback(setCarouselProjectIndex, 750);

    const wasOpen = useRef<boolean>(false);
    const debouncedScrollTo_cancel = useEffectEvent(() => debouncedScrollTo.cancel());


    // Handle carousel open/close
    useEffect(() => {
        console.log('[Carousel] open changed:', open, 'activeIndex:', activeProjectIndexRef.current, 'embla:', !!embla);
        if (!embla) return;
        if(!open) {
            if(wasOpen.current) debouncedScrollTo_cancel(); // or flush?
        } else {
            const index = (activeProjectIndexRef.current)
            if(index !== null) {
                console.log('[Carousel] Opening - reInit and scroll to:', index, activeProjectIndexRef.current, carouselProjectIndexRef.current)
                if(!wasOpen.current) {
                    // console.log('Starting reInit')
                    embla.reInit({ startIndex: index });
                    // console.log('Ending reInit')
                } else if(embla.selectedScrollSnap() !== index)
                    embla.scrollTo(index, false);
            }
        }
        wasOpen.current = open;
    }, [open, embla]);


    // Handle carousel slide selection
    const onSelect = useCallback((emblaApi: EmblaCarouselType | undefined) => {
        if (!emblaApi) {
            // debouncedSetActiveProjectIndex.cancel()
            return
        }
        if(!alreadyOpenRef.current) {
            return
        }
        
        
        const index = emblaApi.selectedScrollSnap();
        // console.log(`[Carousel] onSelect (selectedScrollSnap: ${index})`)
        // console.log('[Carousel] onSelect - scrolling to index:', index, 'current activeIndex:', activeProjectIndex);

        // Update the store's active project index
        // This will trigger URL sync automatically if carousel is open
        // console.log('Setting (debounced) carousel project index to:', index, debouncedSetCarouselProjectIndex.isPending())
        debouncedSetCarouselProjectIndex(index);
    
        // if(index !== activeProjectIndex)
        //     debouncedScrollTo(index, false);
    }, [debouncedSetCarouselProjectIndex/*, activeProjectIndex, debouncedScrollTo*/]);


    const deferredCarouselProjectIndex = React.useDeferredValue(carouselProjectIndex);
    const [_apiPending, startAPITransition] = React.useTransition();

    const updateActiveProjectIndex = React.useEffectEvent((index: number | null) => {
        // console.log('CAROUSEL OPEN:', open);
        if(open && index !== null) {
            // console.log('Starting transition setting activeProjectIndex (debounced) to:', index)
            startAPITransition(()=>debouncedSetActiveProjectIndex(index))
        }
    })

    React.useEffect(()=>{
        updateActiveProjectIndex(deferredCarouselProjectIndex)
    }, [deferredCarouselProjectIndex]);

    const carouselProjectIndexRef = React.useRef<typeof carouselProjectIndex>(carouselProjectIndex);
    React.useEffect(()=>{
        carouselProjectIndexRef.current = carouselProjectIndex
    }, [carouselProjectIndex])

    const activeProjectIndexRef = React.useRef<typeof activeProjectIndex>(activeProjectIndex);
    React.useEffect(()=>{
        activeProjectIndexRef.current = activeProjectIndex
    }, [activeProjectIndex])

    // const deferredCarouselProjectIndexRef = useSyncedRef(deferredCarouselProjectIndex);

    const onSettle = React.useCallback((api: EmblaCarouselType)=>{
        if(!alreadyOpenRef.current) return
        const index = api.selectedScrollSnap()
        // console.log('ON SETTLE', index, deferredCarouselProjectIndexRef.current, carouselProjectIndexRef.current, activeProjectIndexRef.current)
        // console.log('ON SETTLE', index, carouselProjectIndexRef.current, activeProjectIndexRef.current)
        // if(index !== carouselProjectIndex)
        //     console.warn(index, carouselProjectIndex)
        debouncedSetActiveProjectIndex.cancel()
        // setCarouselProjectIndex(index)
        startAPITransition(()=>setActiveProjectIndex(index))
    }, [debouncedSetActiveProjectIndex, setActiveProjectIndex])
    
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

    type Embla = Exclude<typeof embla, undefined>;
    type On = Embla['on'];
    type OnParams = Parameters<On>;
    type CallbackType = OnParams[1];



    const markNewlyVisibleSlides = React.useCallback((_api: EmblaCarouselType, slides: HTMLElement[])=>{
        newlyVisibleSlides.current.forEach(index=>{
            try {
                const slide = slides[index]
                slide.style.visibility = 'visible'
                slide.style.contentVisibility = 'auto'
                visibleSlides.current.add(index)
            } catch(e) {
                console.error(e)
            }
        })
        newlyVisibleSlides.current.clear()
    }, []);

    const markNewlyNotVisibleSlides = React.useCallback((_api: EmblaCarouselType, slides: HTMLElement[])=>{
        newlyNotVisibleSlides.current.forEach(index=>{
            try {
                const slide = slides[index];
                slide.style.visibility = 'hidden';
                slide.style.contentVisibility = 'hidden';
                notVisibleSlides.current.add(index);
            } catch(e) {
                console.error(e)
            }
        })
        newlyNotVisibleSlides.current.clear()
    }, [])

    const updateNewlyVisibleSlides = React.useCallback((api: EmblaCarouselType) => {
        const visibleIndices = api.slidesInView();
        return visibleIndices.reduce<boolean>((prev, index,)=>{
            if(notVisibleSlides.current.delete(index) || newlyNotVisibleSlides.current.delete(index)) {
                newlyNotVisibleSlides.current.add(index)
                return true;
            }
            return prev;
        }, false)
    }, []);
    
    const updateNewlyNotVisibleSlides = React.useCallback((api: EmblaCarouselType) => {
        const notVisibleIndices = api.slidesNotInView();
        return notVisibleIndices.reduce<boolean>((prev, index,)=>{
            if(visibleSlides.current.delete(index)) {
                newlyNotVisibleSlides.current.add(index)
                return true;
            }
            return prev;
        }, false)
    }, []);

    const [requestFrame,] = useAnimationFrameRequest();
    // const [requestIdle, cancelIdleRequest] = useIdleCallbackRequest();


    const updateNewlyNotVisibleSlides_ = React.useCallback((api: Embla) => {
        if(updateNewlyNotVisibleSlides(api))
            React.startTransition(()=>{
                markNewlyNotVisibleSlides(api, api.slideNodes())
            })
    }, [updateNewlyNotVisibleSlides, markNewlyNotVisibleSlides]);

    const updateNewlyNotVisibleSlidesDebounced = useThrottledDebounce(updateNewlyNotVisibleSlides_, 50, 150);
    const updateNewlyVisibleSlidesDebounced = React.useCallback((api: EmblaCarouselType)=>{
        requestFrame(()=>{
            if(updateNewlyVisibleSlides(api)) {
                markNewlyVisibleSlides(api, api.slideNodes())
            }
        })
    }, [requestFrame, markNewlyVisibleSlides, updateNewlyVisibleSlides])

    const onSlidesInView: CallbackType = React.useCallback((api, _evtType) => {
        updateNewlyVisibleSlidesDebounced(api);
        updateNewlyNotVisibleSlidesDebounced(api);
    }, [updateNewlyVisibleSlidesDebounced, updateNewlyNotVisibleSlidesDebounced])

    const onInit: CallbackType = React.useCallback((_api)=>{
        alreadyOpenRef.current = true
    }, [])

    const onDestroy = React.useCallback(()=>{
        alreadyOpenRef.current = false;
    }, [])

    // Subscribe to embla events
    useEffect(() => {
        if (!embla) return;
        
        embla
            .on('reInit', onEmblaReInit)
            .on('select', onSelect)
            .on('slidesInView', onSlidesInView)
            .on('settle', onSettle)
            .on('init', onInit)
            .on('destroy', onDestroy)
        
        return () => { 
            embla
                .off('reInit', onEmblaReInit)
                .off('select', onSelect)
                .off('slidesInView', onSlidesInView)
                .off('settle', onSettle)
                .off('init', onInit)
                .off('destroy', onDestroy)
        };
    }, [embla, onEmblaReInit, onSelect, onSlidesInView, onSettle, onInit, onDestroy]);



    // const noPropagate = (e: React.PointerEvent<HTMLButtonElement | HTMLDivElement>) => {
    //     // console.log('noPropagate', e)
    //     e.stopPropagation();
    // };

    const bstore = useBrowserStore()
    const lightboxOpen = useBrowserContext(s=>s.lightboxOpen);
    const dialogOnClick: MouseEventHandler<HTMLDivElement> = React.useCallback((e) => {
        // console.log('DIALOGONCLICK -- lightboxOpen:', lightboxOpen);
        if(!lightboxOpen) {
            e.preventDefault();
            setOpen(false);
        }
    }, [setOpen, lightboxOpen]);

    const onOpenChange_ = React.useCallback((open: boolean) => {
        // console.log('Open changed flushing scrollTo:', open);
        onOpenChange(open);
        debouncedScrollTo.flush();
    }, [onOpenChange, debouncedScrollTo]);

    useEffect(()=>{
        if(!embla) return;

        const callback = (evt: KeyboardEvent) => {
            // console.log('Key up/down:', evt, evt.defaultPrevented);
            if(evt.defaultPrevented) return;
            const lightboxOpen = bstore.getState().lightboxOpen;
            if(lightboxOpen) {
                evt.preventDefault()
                return;
            }
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
            evt.stopImmediatePropagation();
            evt.stopPropagation();
        };
        window.addEventListener('keydown', callback, {capture: true});
        return () => { 
            window.removeEventListener('keydown', callback, {capture: true});
        };
        
    }, [embla, bstore]);

    const dialogFallback = React.useMemo(()=><CarouselFallback/>, [])

    return (
        <React.Suspense fallback={<div className="z-50 absolute w-screen h-screen bg-red-500 suspense-fallback">LOADING CAROUSEL DIALOG</div>}>
            <Dialog open={open} onOpenChange={onOpenChange_} modal={true}>
                <DialogPortal container={document.getElementById('modal-root')}>
                    <React.Suspense fallback={<div className="w-full h-full bg-orange-400 suspense-fallback">LOADING CAROUSEL DIALOG CONTENT</div>}>
                        <DialogContent 
                            className="border-0 shadow-none p-0 m-0 items-center justify-center focus:outline-none z-50 [content-visibility:auto] flex w-full h-full inset-0 pointer-events-none overflow-clip" 
                            aria-describedby={undefined}
                            showCloseButton={false}
                            // style={{contentVisibility: 'auto'}}
                            // onKeyUp={(evt)=>{
                                //     console.log('Key up:', evt);
                                // }}
                                >
                                <DialogOverlay 
                                    id="carousel-dialog-overlay"
                                    ref={overlayRef} 
                                    className="fixed p-0 m-0 inset-0 z-40 bg-black/40 backdrop-blur-sm"
                                    onClick={dialogOnClick}
                                    // onPointerDownCapture={noPropagate}
                                    // onPointerUpCapture={noPropagate}
                                    // onPointerDown={noPropagate}
                                    />
                                <VisuallyHidden>
                                    <DialogHeader>
                                        <DialogTitle>Project Carousel</DialogTitle>
                                    </DialogHeader>
                                </VisuallyHidden>
                                <React.Suspense fallback={dialogFallback} /*fallback={<div className="w-full h-full bg-yellow-300 suspense-fallback">LOADING CAROUSEL</div>}*/>
                                    <ProjectCarousel ref={emblaRef} slides={slides} onCarouselSelect={onSelect} externalApi={embla} showToast={showToast} getHovercardContentForIndex={getHovercardContentForIndex}
                                        prevRef={prevRef} nextRef={nextRef}
                                    />
                                </React.Suspense>
                        </DialogContent>
                    </React.Suspense>
                </DialogPortal>
            </Dialog>
        </React.Suspense>
    );
}