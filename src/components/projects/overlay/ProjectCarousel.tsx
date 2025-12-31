import { Carousel, CarouselContent, CarouselItem, CarouselNav, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { type EmblaViewportRefType } from "embla-carousel-react";
import React, { type PointerEventHandler } from "react";
import type { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { Card, CardContent, CardHeader, CardScrollArea, CardTitle } from "@/components/ui/card";
import { DialogClose } from "./TransparentDialog";
import { XIcon } from "lucide-react";
import { ShareButton } from "../grid/items/sharing/ShareCard";
import type { ShowToastFn } from "../filtering/common/filterTypes";
import type { CarouselContentItemWithTitle } from "./ProjectCarouselDialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectInfoForProvider } from "../details/ProjectProviderBase";
import ProjectProvider from "../details/ProjectProvider";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import ProjectCarouselContextMenuContent, { type ProjectCarouselContextMenuContentHandle } from "./contextMenu";
import { cn } from "@/lib/utils";
import SelectionToolbar from "./SelectionToolbar";
import useSelection from "./useSelection";
import useAnimateMount from "@/hooks/useAnimateHeight";

import {gsap} from 'gsap';
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
// import type { BrowserStore } from "../filtering/common/stores/browserStore";
// import type { ProjectInfo } from "../types";

type ProjectCarouselProps = Omit<React.ComponentProps<typeof Carousel>, 'externalCarouselRef'> & {
    ref?: EmblaViewportRefType,
    slides: CarouselContentItemWithTitle[],
    prevRef?: React.RefObject<HTMLButtonElement | null>,
    nextRef?: React.RefObject<HTMLButtonElement | null>,
    onCarouselSelect: (emblaApi: EmblaCarouselType | undefined, evtType?: EmblaEventType) => void,
    externalApi?: EmblaCarouselType,
    showToast: ShowToastFn,
    // getHovercardContentForIndex: (index: number) => React.ReactNode,
    hovercardContents: React.JSX.Element[],
}



type ProjectCarouselItemHandle = {
    setIsCurrent: (isCurrent: boolean) => void,
    getTextElements: () => HTMLElement[],
    onSettled: () => void,
}

type ProjectCarouselItemProps = React.ComponentProps<typeof CarouselItem> & {
    index: number,
    slide: CarouselContentItemWithTitle,
    onPointerDown: PointerEventHandler,
    showToast: ShowToastFn,
    handleRef?: React.RefObject<ProjectCarouselItemHandle | null>,
    startTransition: ReturnType<typeof React.useTransition>[1],
    project: ProjectInfoForProvider,
    selectableText: number,
    setSelectableText: React.Dispatch<React.SetStateAction<number>>,
    // itemRef?: React.RefObject<ProjectCarouselItemCardHandle>,
}


const CarouselSlideContentSkeleton = React.memo((props: React.ComponentProps<'div'>)=>{
    return (
        <div {...props}>
            <div className="flex flex-col space-y-3">
                <Skeleton className="h-31.25 w-62.5 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-62.5" />
                    <Skeleton className="h-4 w-50" />
                </div>
            </div>
        </div>
    );
});

const ProjectCarouselItem = React.memo(({ itemRef, selectableText, setSelectableText, project, handleRef, startTransition, index: i, slide, onPointerDown: clickCallback, showToast, ...props }: ProjectCarouselItemProps) => {
    const [isCurrentItem, setIsCurrentItem] = React.useState<boolean>(false);
    const isCurrent = React.useDeferredValue<boolean>(isCurrentItem);

    const deactivationTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const activationTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const cardRef = React.useRef<ProjectCarouselItemCardHandle>(null);

    const setIsCurrent = React.useCallback((isCurrent: boolean) => {
        if(isCurrent) {
            clearTimeout(deactivationTimeout.current);
            deactivationTimeout.current = undefined;
            if(activationTimeout.current === undefined) {
                activationTimeout.current = setTimeout (()=>{
                    // React.startTransition(()=>
                        setIsCurrentItem(isCurrent)
                    // );
                    activationTimeout.current = undefined;
                }, 200);
            }
            return;
        }
        clearTimeout(activationTimeout.current);
        activationTimeout.current = undefined;
        if(deactivationTimeout.current === undefined) {
            deactivationTimeout.current = setTimeout(()=>{
                // React.startTransition(()=>
                    setIsCurrent(false)
                // );
                deactivationTimeout.current = undefined;
            }, 2500);
        }
    }, []);

    
    const menuRef = React.useRef<ProjectCarouselContextMenuContentHandle>(null);

    const divRef = React.useRef<HTMLDivElement>(null);
    const getTextElements = React.useCallback((): HTMLElement[] =>{
        const div = divRef.current;
        if(!div) return [];
        return Array.from(div.querySelectorAll('.project-carousel-item-text'));
    }, []);

    const onSettled = React.useCallback(()=>{
        cardRef.current?.onSettled();
    }, [])
    
    React.useImperativeHandle(handleRef, ()=>({
        getTextElements,
        setIsCurrent,
        onSettled
    }), [setIsCurrent, getTextElements, onSettled]);

    return <CarouselItem key={i} id={`slide-${i}`} className="project-carousel-item pointer-events-auto h-min" {...props}>
        <ContextMenu>
            <ContextMenuTrigger disabled={selectableText==1} asChild>
                <ProjectCarouselItemCard ref={cardRef} selectableText={selectableText} isCurrent={isCurrent} divRef={divRef} project={project} showToast={showToast} slide={slide}/>
            </ContextMenuTrigger>
            <ProjectCarouselContextMenuContent isProjectActive={isCurrent} handleRef={menuRef} selectableText={selectableText} setSelectableText={setSelectableText} />
        </ContextMenu>
    </CarouselItem>
});

type ProjectCarouselItemCardProps = Pick<ProjectCarouselItemProps, 'selectableText' | 'project' | 'slide' | 'showToast'> & {
    isCurrent: boolean, divRef: React.RefObject<HTMLDivElement|null>, ref?: React.RefObject<ProjectCarouselItemCardHandle | null>,
}
type ProjectCarouselItemCardHandle = {
    onSettled: () => void,
}

const ProjectCarouselItemCard = React.memo(({ ref, isCurrent, divRef, selectableText, project, slide, showToast, ...props }: ProjectCarouselItemCardProps) => {
    const [isAnimating, setIsAnimating] = React.useState<boolean>(true);
    const [_isPendingHeight, startHeightTransition] = React.useTransition();
    const isAnimatingDeferred = React.useDeferredValue(isAnimating);

    const currAnim = React.useRef<GSAPTween | undefined>(undefined);
    const skeletonHeight = React.useRef<number | undefined>(undefined);
   
    const animateCardIn = React.useCallback((el: HTMLDivElement, changed: boolean): void =>{
        // console.log('Animating height in', project.id, el, changed, skeletonHeight.current)
        if(!changed || undefined === skeletonHeight.current) return;
        startHeightTransition(()=>{
            currAnim.current?.kill()
            currAnim.current = gsap.fromTo(el, 
                {height: skeletonHeight.current},
                {
                    height: el.scrollHeight,
                    duration: 0.2,
                    onStart: () => {
                        setIsAnimating(true);
                    },
                    onComplete: ()=>{
                        gsap.set(el, {height: 'auto'});
                        setIsAnimating(false);
                    },
                    onInterrupt: () => {
                        setIsAnimating(false);
                    }
                }
            )
        })
    }, [startHeightTransition])
    const animateCardInDebounced = useDebounceCallback(animateCardIn, 750);
    const animateCardOut = React.useCallback(()=>{
        animateCardInDebounced.cancel();
    }, [animateCardInDebounced])
    const animateSkeletonOut = React.useCallback((el: HTMLDivElement | null, changed: boolean) => {
        // console.log('Animating height out:', project.id, changed, el, skeletonHeight.current)
        if(!changed || !el) return;
        // animateCardInDebounced.cancel()
        setIsAnimating(true);
        skeletonHeight.current = el.clientHeight;
    }, [])
    const [refCallback,] = useAnimateMount(animateCardIn, animateCardOut)
    const [skeletonRefCallback,] = useAnimateMount(animateCardOut, animateSkeletonOut);

    const onSettled = React.useCallback(()=>{
        console.log('ON SETTLED');
        if(animateCardInDebounced.isPending())
            animateCardInDebounced.flush();
    }, [animateCardInDebounced]);
    React.useImperativeHandle(ref, ()=>({onSettled}), [onSettled]);
    
    const skeleton = React.useMemo(()=><CarouselSlideContentSkeleton ref={skeletonRefCallback}/>, [skeletonRefCallback]);

    const isCurrentDeferred = React.useDeferredValue(isCurrent);

    const className = React.useMemo(()=>cn(
        "project-carousel-item-card relative w-full flex pointer-events-auto max-h-[calc(100svh-(--spacing(25)))] select-none",
        !isCurrentDeferred || isAnimatingDeferred ? 'overflow-hidden' : 'overflow-y-auto',
        selectableText ? 'enable-text-selection' : undefined
    ), [isCurrentDeferred, isAnimatingDeferred, selectableText]);

    return (
        <Card ref={divRef} className={className} {...props}>
            {/* <div className="absolute w-full h-16 bg-yellow-500 top-[calc(-4*var(--spacing))]">
                <DialogClose data-slot="dialog-close" aria-label="Close project details carousel"
                    className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground sticky top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 not-disabled:cursor-pointer">
                    <XIcon></XIcon>
                </DialogClose>
            </div> */}
            <DialogClose data-slot="dialog-close" aria-label="Close project details carousel"
                className="z-2 pointer-events-auto ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 not-disabled:cursor-pointer">
                <XIcon></XIcon>
            </DialogClose>
            <CardScrollArea>
            {/* <div className="relative w-full h-full"> */}
                <CardHeader className="w-full">
                    <CardTitle>
                        <div className="text-wrap lg:mr-50 max-lg:pt-6">
                            <span className="project-carousel-item-text">{slide.title}</span>
                        </div>
                    </CardTitle>
                </CardHeader>
                {/* <div className="absolute w-full h-full pointer-events-none bg-none inset-0">
                    <div className="relative">
                    </div>
                </div> */}
                <CardContent className="project-carousel-item-card-content pointer-events-auto overflow-y-visible">
                    {/* <DialogClose data-slot="dialog-close" aria-label="Close project details carousel"
                        className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 not-disabled:cursor-pointer">
                        <XIcon></XIcon>
                    </DialogClose> */}
                    <ShareButton className="absolute lg:right-12 max-lg:left-4 top-3" disabled={!isCurrent} showToast={showToast} openProjectId={slide.props["data-project-id"]} />    

                    {/* accessible close: give button an explicit aria-label */}
                    {/* <DialogClose aria-label="Close carousel" data-slot="dialog-close" className="sr-only" /> */}
                    {/* above sr-only DialogClose is a compact additional accessible control -- main visual close still has icon */}
                    <ProjectProvider project={project}>
                        {isCurrent ? 
                            <React.Suspense fallback={skeleton}>
                                <div ref={refCallback} className="project-carousel-item-text w-full h-full overflow-visible">
                                    {slide}
                                </div>
                            </React.Suspense>
                            : skeleton
                        }
                    </ProjectProvider>
                </CardContent>
                {/* </div> */}
            </CardScrollArea>
        </Card>
    )
});


const clickCallback: PointerEventHandler = (evt) => evt.stopPropagation();
const ProjectCarousel = (({
    ref: emblaRef,
    externalApi: embla,
    opts,
    onCarouselSelect: onSelect,
    slides,
    prevRef,
    nextRef,
    showToast,
    hovercardContents,
}: ProjectCarouselProps) => {

    const slideHandles = React.useRef<Record<string, React.RefObject<ProjectCarouselItemHandle>>>({});
    slideHandles.current = Object.fromEntries(slides.map((slide) => [slide.props["data-project-id"], slideHandles.current[slide.props['data-project-id']] ?? React.createRef()]));

    const [_isPending, startTransition] = React.useTransition();

    const [selectableText, setSelectableText] = React.useState<number>(0);
    
    const slideElems = React.useMemo(()=>{
        return slides.map((slide, i) => (
            <ProjectCarouselItem handleRef={slideHandles.current[slide.props["data-project-id"]]} startTransition={startTransition} index={i} slide={slide} showToast={showToast} onPointerDown={clickCallback} project={slide.project} selectableText={selectableText} setSelectableText={setSelectableText}></ProjectCarouselItem>
        ))
    }, [slides, showToast, selectableText]);
    
    const {targetElements: selectionTargetElements, setSelection, anySelection, fullSelection, setEnabled: setSelectionMonitoringEnabled} = useSelection(false);
    const selectAll = React.useCallback(()=>setSelection(true), [setSelection]);
    const selectNone = React.useCallback(()=>setSelection(false), [setSelection]);

    const setTargetElements = React.useCallback((slide: ProjectCarouselItemHandle) => {
        const newElements = slide.getTextElements();
        selectionTargetElements.current = newElements.map((el,i)=>{
            const ref = selectionTargetElements.current[i] ?? React.createRef();
            ref.current = el;
            return ref;
        });
    }, [selectionTargetElements]);


    const toolbarOpen = React.useMemo(()=>!!selectableText, [selectableText]);
    const onToolbarOpenChange = React.useCallback((open: boolean) => {
        startTransition(()=>{
            setSelectionMonitoringEnabled(open)
            setSelectableText(open ? 1 : 0);
        })
    }, [setSelectionMonitoringEnabled]);

    const onSelect0: typeof onSelect = React.useCallback((api, _evtType) => {
        if(!api) return;
        const index = api.selectedScrollSnap();
        const prevIndex = api.previousScrollSnap();

        const currId = slides[index]?.props['data-project-id'];
        const currHandle = currId ? slideHandles.current[currId] : undefined;

        const prevId = slides[prevIndex]?.props['data-project-id'];
        const prevHandle = (prevIndex === index || !prevId) ? undefined : slideHandles.current[prevId];

        startTransition(()=>{
            try {
                prevHandle?.current?.setIsCurrent(false);
            } finally {
                if(currHandle?.current) {
                    currHandle.current.setIsCurrent(true);
                    setTargetElements(currHandle.current);
                }
            }
        });
    }, [slides, setTargetElements]);

    const onSelect_: typeof onSelect = React.useCallback((api, evtType) => {
        try {
            onSelect0(api, evtType);
        } finally {
            // startTransition(()=>onSelect(api));
            onSelect(api, evtType);
        }
    }, [onSelect, onSelect0]);

    React.useEffect(()=>{
        embla?.reInit({watchDrag: !toolbarOpen});
    }, [toolbarOpen, embla]);

    React.useEffect(()=>{
        if(!embla) return;
        const callback: Parameters<typeof embla.on>[1] = (api)=>{
            const index = api.selectedScrollSnap()
            const handle = slideHandles.current[index];
            handle?.current?.onSettled();
        }
        embla.on('settle', callback)
            .on('init', callback)
        return ()=>{
            embla.off('settle', callback)
                .off('init', callback)
        }
    }, [embla])


    return <>
        <ProjectCarouselInner ref={emblaRef} externalApi={embla} opts={opts} prevRef={prevRef} nextRef={nextRef} hovercardContents={hovercardContents} onCarouselSelect={onSelect_} slideElems={slideElems}/>
        <SelectionToolbar open={toolbarOpen} onOpenChange={onToolbarOpenChange} setTextSelectionMode={setSelectableText} anySelection={anySelection} fullSelection={fullSelection} buttonGroupProps={undefined} selectAll={selectAll} selectNone={selectNone}/>
    </>
});





// const CarouselHoverCard = React.memo(({index, project, numCards}: {index: number, numCards: number, project: ProjectInfo}) => {
//     const resolveRef = React.useRef<undefined | ((value: any) => any)>(undefined);
//     const promiseRef = React.useRef<Promise<any>>(new Promise(resolve=>{resolveRef.current = resolve;}))

//     const component = React.use(promiseRef.current);

//     React.useEffect(()=>{
//         if(!resolveRef.current)
//             promiseRef.current = new Promise(resolve=>{resolveRef.current = resolve});
    
//         resolveRef.current?.(<)


//     }, [browserStore]);

// });



const ProjectCarouselInner = React.memo(({
    ref: emblaRef,
    externalApi: embla,
    opts,
    onCarouselSelect,
    prevRef,
    nextRef,
    hovercardContents,
    slideElems,
}: Omit<ProjectCarouselProps, 'slides' | 'showToast'> & {
    slideElems: React.JSX.Element[]
}) => {




    return (
        <Carousel
            ref={emblaRef}
            externalCarouselRef={emblaRef}
            externalApi={embla}
            opts={opts}
            className="overflow-visible z-60 w-full max-w-[calc(min(100vw,var(--container-2xl)))] pointer-events-none"
            onCarouselSelect={onCarouselSelect}
        >
        <CarouselContent
            id="embla-container"
            className="overflow-visible pointer-events-none
                items-center 
                max-h-[calc(min(100svh,100%)-(--spacing(20)))]
                will-change-transform transform-[translateZ(0)]"
        >
            {...slideElems}
        </CarouselContent>
        <CarouselPrevious ref={prevRef} size="lg" className='pointer-events-auto max-md:hidden' />
        <CarouselNext ref={nextRef} size="lg" className='pointer-events-auto max-md:hidden' />

        <CarouselNav className='z-10000 pointer-events-auto' hovercards={hovercardContents}/>
    </Carousel>)
});

export default ProjectCarousel;