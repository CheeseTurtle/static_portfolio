import { Carousel, CarouselContent, CarouselItem, CarouselNav, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { type EmblaViewportRefType } from "embla-carousel-react";
import React, { type PointerEventHandler } from "react";
import type { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type ProjectCarouselProps = Omit<React.ComponentProps<typeof Carousel>, 'externalCarouselRef'> & {
    ref?: EmblaViewportRefType,
    // slideElems: React.JSX.Element[],
    slides: CarouselContentItemWithTitle[],
    prevRef?: React.RefObject<HTMLButtonElement | null>,
    nextRef?: React.RefObject<HTMLButtonElement | null>,
    onCarouselSelect: (emblaApi: EmblaCarouselType | undefined, evtType?: EmblaEventType) => void,
    externalApi?: EmblaCarouselType,
    showToast: ShowToastFn,
    getHovercardContentForIndex: (index: number) => React.ReactNode,
}



type ProjectCarouselItemHandle = {
    setIsCurrent: (isCurrent: boolean) => void,
    // closeMenu: () => void,
    getTextElements: () => HTMLElement[],
}

type ProjectCarouselItemProps = React.ComponentProps<typeof CarouselItem> & {
    index: number,
    slide: CarouselContentItemWithTitle,
    // isCurrentItem: boolean,
    onPointerDown: PointerEventHandler,
    showToast: ShowToastFn,
    handleRef?: React.RefObject<ProjectCarouselItemHandle>,
    startTransition: ReturnType<typeof React.useTransition>[1],
    project: ProjectInfoForProvider,
    selectableText: number,
    setSelectableText: React.Dispatch<React.SetStateAction<number>>,
}



const CarouselSlideContentSkeleton = React.memo((props: React.ComponentProps<'div'>)=>{
    return (
        <div {...props}>
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



const ProjectCarouselItem = React.memo(({ selectableText, setSelectableText, project, handleRef, startTransition, index: i, slide, onPointerDown: clickCallback, showToast, ...props }: ProjectCarouselItemProps) => {


    // const skeletonRef = React.useRef<HTMLDivElement>(null);
    const [isCurrentItem, setIsCurrentItem] = React.useState<boolean>(false);
    const isCurrent = React.useDeferredValue<boolean>(isCurrentItem);

    const deactivationTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const activationTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    
    React.useImperativeHandle(handleRef, ()=>({
        getTextElements,
        setIsCurrent
    }), [setIsCurrent, getTextElements]);

    const [isAnimating, setIsAnimating] = React.useState<boolean>(true);

    const currAnim = React.useRef<GSAPTween | undefined>(undefined);
    const skeletonHeight = React.useRef<number | undefined>(undefined);
    const animateCardIn = React.useCallback((el: HTMLDivElement, changed: boolean): void =>{
        console.log('Animating height in', el, changed, skeletonHeight.current)
        if(!changed || undefined === skeletonHeight.current) return;
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
    }, [])

    const animateCardOut = React.useCallback((el: HTMLDivElement | null, changed: boolean) => {
        if(!changed || !el) return;
        setIsAnimating(true)
        skeletonHeight.current = el.clientHeight
    }, [])

    const isAnimatingDeferred = React.useDeferredValue(isAnimating);

    const [refCallback,] = useAnimateMount(animateCardIn)
    const [skeletonRefCallback,] = useAnimateMount(undefined, animateCardOut);
    const skeleton = React.useMemo(()=><CarouselSlideContentSkeleton ref={skeletonRefCallback}/>, [skeletonRefCallback]);
    

    return <CarouselItem key={i} id={`slide-${i}`} className="project-carousel-item pointer-events-auto h-min" {...props}>
        <ContextMenu>
            <ContextMenuTrigger disabled={selectableText==1} asChild>
                <Card ref={divRef} className={cn(
                    "project-carousel-item-card relative w-full flex pointer-events-auto max-h-[calc(100vh-(--spacing(25)))] select-none",
                    isAnimatingDeferred ? 'overflow-y-clip' : 'overflow-y-auto',
                    selectableText ? 'enable-text-selection' : undefined
                )}>
                    {/* <div className="h-max w-full flex flex-col"> */}
                        <CardHeader className="">
                            <CardTitle className="">
                                <div className="text-wrap mr-50">
                                    <span className="project-carousel-item-text">{slide.title}</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="project-carousel-item-card-content pointer-events-auto overflow-y-visible">
                            <DialogClose data-slot="dialog-close"
                                className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"><XIcon></XIcon></DialogClose>
                            <ShareButton className="absolute right-12 top-3" disabled={!isCurrent} showToast={showToast} openProjectId={slide.props["data-project-id"]} />    

                            {/* accessible close: give button an explicit aria-label */}
                            {/* <DialogClose aria-label="Close carousel" data-slot="dialog-close" className="sr-only" /> */}
                            {/* above sr-only DialogClose is a compact additional accessible control -- main visual close still has icon */}
                            {/* <ShareButton className="absolute top-4 right-14 text-sm" showToast={showToast} openProjectId={slide.props["data-project-id"]} /> */}
                            <ProjectProvider project={project}>
                                {isCurrent ? 
                                    <React.Suspense fallback={skeleton}>
                                        <div ref={refCallback} className="project-carousel-item-text w-full h-full overflow-y-visible overflow-x-hidden">
                                            {slide}
                                        </div>
                                    </React.Suspense>
                                    : skeleton
                                }
                            </ProjectProvider>
                        </CardContent>
                        {/* <SelectionToolbar open={true} onOpenChange={undefined} buttonGroupProps={undefined}/> */}
                    {/* </div> */}
                </Card>
            </ContextMenuTrigger>
            <ProjectCarouselContextMenuContent isProjectActive={isCurrent} handleRef={menuRef} selectableText={selectableText} setSelectableText={setSelectableText} />
        </ContextMenu>
    </CarouselItem>
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
    getHovercardContentForIndex,
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
    
    const {targetElements, setSelection, anySelection, fullSelection, setEnabled} = useSelection(false);

    const setTargetElements = React.useCallback((slide: ProjectCarouselItemHandle) => {
        const newElements = slide.getTextElements();
        targetElements.current = newElements.map((el,i)=>{
            const ref = targetElements.current[i] ?? React.createRef();
            ref.current = el;
            return ref;
        });
    }, [targetElements]);

    const selectAll = React.useCallback(()=>setSelection(true), [setSelection]);
    const selectNone = React.useCallback(()=>setSelection(false), [setSelection]);

    const toolbarOpen = React.useMemo(()=>selectableText===1, [selectableText]);
    // const closeToolbar = React.useCallback(()=>setSelectableText(0), )
    const onOpenChange = React.useCallback((open: boolean) => setSelectableText(open ? 1 : 0), []);

    const onSelect0: typeof onSelect = React.useCallback((api, _evtType) => {
        if(!api) return;
        const index = api.selectedScrollSnap();
        const prevIndex = api.previousScrollSnap();

        const currId = slides[index]?.props['data-project-id'];
        const currHandle = currId ? slideHandles.current[currId] : undefined;

        // if(!currHandle) return;
        const prevId = slides[prevIndex]?.props['data-project-id'];
        const prevHandle = (prevIndex === index || !prevId) ? undefined : slideHandles.current[prevId];
        // console.log(currHandle, prevHandle);
        startTransition(()=>{
            try {
                prevHandle?.current?.setIsCurrent(false);
            } finally {
                currHandle?.current?.setIsCurrent(true);
                if(currHandle?.current) setTargetElements(currHandle.current);
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
        if(!embla) return;
        embla.reInit({watchDrag: !toolbarOpen});
    }, [toolbarOpen, embla]);


    React.useEffect(()=>{

        if(!embla) return;
        const handler = () => {
            setEnabled(true);
        }
        const handler2 = () => {
            setEnabled(false);
        }
        embla.on('init', handler).on('reInit', handler).on('destroy', handler2);


        return () => {
            embla.off('init', handler).off('reInit', handler).off('destroy', handler2);
        }
    }, [embla, setEnabled])


    return <>
        <ProjectCarouselInner ref={emblaRef} externalApi={embla} opts={opts} prevRef={prevRef} nextRef={nextRef} getHovercardContentForIndex={getHovercardContentForIndex} onCarouselSelect={onSelect_} slideElems={slideElems}/>
        {/* <div className="flex w-full z-10001"> */}
        <SelectionToolbar open={toolbarOpen} onOpenChange={onOpenChange} setTextSelectionMode={setSelectableText} anySelection={anySelection} fullSelection={fullSelection} buttonGroupProps={undefined} selectAll={selectAll} selectNone={selectNone}/>
        {/* </div> */}
    </>
});

const ProjectCarouselInner = React.memo(({
    ref: emblaRef,
    externalApi: embla,
    opts,
    onCarouselSelect,
    prevRef,
    nextRef,
    getHovercardContentForIndex,
    slideElems,
}: Omit<ProjectCarouselProps, 'slides' | 'showToast'> & {
    slideElems: React.JSX.Element[]
}) => {
    return <>
        <Carousel
            ref={emblaRef}
            externalCarouselRef={emblaRef}
            externalApi={embla}
            opts={opts}
            className="overflow-visible z-60 w-full max-w-[calc(min(100vw,var(--container-2xl)))] pointer-events-none
// style={{"
            onCarouselSelect={onCarouselSelect}
            >
            <CarouselContent
                id="embla-container"
                className="overflow-visible pointer-events-none
                    items-center 
                    max-h-[calc(100%-(--spacing(20)))]
                    [will-change]-transform transform-[translateZ(0)]
                    "
                    // max-2xl:bg-green-300 max-sm:bg-yellow-300
                    // px-5
                    // max-w-[calc(100%-(--spacing(20)))] w-full
                //     willChange: 'transform',
                //     transform: 'translateZ(0)'
                // }}
            >
                {...slideElems}
            </CarouselContent>
            <CarouselPrevious ref={prevRef} size="lg" className='pointer-events-auto not-disabled:cursor-pointer disabled:cursor-not-allowed max-md:hidden' />
            <CarouselNext ref={nextRef} className='pointer-events-auto  max-md:hidden not-disabled:cursor-pointer disabled:cursor-not-allowed' />

            <CarouselNav className='z-10000 pointer-events-auto not-disabled:cursor-pointer' getHovercardContentForIndex={getHovercardContentForIndex}/>

        </Carousel>
    </>
});

export default ProjectCarousel;