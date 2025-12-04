import React, { useCallback, useMemo, useReducer } from "react";
import FSLightbox from "fslightbox-react";
import { createPortal } from "react-dom";
import useMutationObserver from "@/hooks/use-mutation-observer";
import { LightboxContext, lightboxReducer, type LightboxCaptions, type LightboxSources } from "./lightbox";

import {Flip} from "gsap/Flip";
import {gsap} from "gsap";
import useThrottledDebounce from "@/hooks/useThrottledDebounce";
import { cn } from "@/lib/utils";
import type { WithRequired } from "node_modules/astro/dist/type-utils";
import { useUnmount } from "@/hooks/use-unmount";


export function CaptionedLightboxProvider({children, onClose, openRef}: {children: React.ReactNode, onClose?: () => void, openRef: React.RefObject<boolean>}) {
    const [state, dispatch] = useReducer(lightboxReducer, {captions: [], initialSlide: 1, open: false, sources: [] });

    const onClose_ = useCallback(()=>{
        dispatch({type: 'CLOSE'});
        onClose?.();
    }, [onClose, dispatch]);

    return <LightboxContext.Provider value={{
        state, dispatch
    }}>
        {/*(state.open || openRef.current) && */<CaptionedLightbox {...state} openRef={openRef} onClose={onClose_}></CaptionedLightbox>}
        {children}
    </LightboxContext.Provider>;
}


function useLightboxSlideObserver(snRef: React.RefObject<HTMLSpanElement | null>, captionSlide: number | undefined, setCaptionSlide: React.Dispatch<React.SetStateAction<number | undefined>>, overlayRef: React.RefObject<LightboxCaptionsOverlayHandle | null>) {
    /* div.fslightbox-container.fslightbox-full-dimension
    //   div.flightbox-nav
    //     div.fslightbox-toolbar
    //     div.fslightbox-sn
    //       span 
    //       span.fslightboxsl
    //       span
    //   div.fslightbox-absoluted.fslightbox-full-dimension
    //     div.fslightbox-absoluted.fslightbox-full-dimension.fslightbox-flex-centered(style="transform: translateX(...);")
    //       (div.class="fslightbox-fade-in")
    //         img.fslightbox-source.fslightbox-opacity-1(src="...")
    */

    const captionSlideRef = React.useRef<number | undefined>(captionSlide);
    const setCaptionSlideRef = React.useRef<React.Dispatch<React.SetStateAction<number | undefined>>>(setCaptionSlide);

    React.useEffect(()=>{
        captionSlideRef.current = captionSlide;
    }, [captionSlide]);

    React.useEffect(()=>{
        setCaptionSlideRef.current = setCaptionSlide;
    }, [setCaptionSlide]);

    const callback: MutationCallback = React.useCallback((mutations: MutationRecord[], observer: MutationObserver)=>{
        const clMutations = mutations.filter(x=>x.type === 'childList');
        if(!clMutations.length) return;
        // console.log('Observer / mutations:', observer, mutations);
        
        const lastMutation = clMutations[clMutations.length - 1];
        const addedNode = (lastMutation.addedNodes[0] as Text);
        if(!addedNode.data) return;
        const numVal = Number(addedNode.data);
        if(numVal === captionSlideRef.current) return;
        
        if(isNaN(numVal)) return;

        // Debounced & throttled transition to new caption
        setCaptionSlideRef.current?.(numVal);
    }, []);

    useMutationObserver(snRef, callback, {characterData: false, characterDataOldValue: false, attributes: false, childList: true, subtree: false});
}


interface FSLightboxInstance extends FSLightbox {
    close: () => void,
    collections: {
        sourceLoadHandlers?: {
            handleCustomLoad?: () => any,
            handleImageLoad?: (e: any) => any,
            handleNotMetaDatedVideoLoad?: () => any,
            handleVideoLoad: () => any,
            handleYoutubeLoad: () => any,
        }[],
        sourceSizers: Array<any>,
        sourcesRenderFunctions: Array<any>,
    },
    core: {
        globalEventsController: object,
        lightboxCloser: object,
        lightboxUpdater: object,
        scrollbarRecompensor: object,
        slideChangeFacade: object,
        slideIndexChanger: object,
        sourceDisplayFacade: object,
        sourcesPointerDown: object,
        stageManager: object,
        windowResizeActioner: object
    },
    data: {
        isFullscreenOpen: boolean,
        scrollbarWidth: number
    },
    elements: {
        a: Array<HTMLElement>,
        container: HTMLDivElement,
        slideSwipingHoverer: HTMLDivElement,
        smw: Array<HTMLDivElement>,
        sourceAnimationWrappers: Array<HTMLDivElement>,
        sourceWrappersContainer: HTMLDivElement,
        sources: Array<HTMLImageElement | HTMLElement>,
    },
    open: ()=>void,
    props: {
        autoplays: Array<any>,
        customAttributes: Array<any>,
        customClasses: Array<string>,
        exitFullscreenOnClose: boolean
        maxYoutubeDimensions?: any,
        // onClose: function onClose(_instance)​​
        // onInit: ....
        // onOpen: function onOpen(instance)​​
        // onShow: function onShow(instance)​​
        // onSourceLoad: function onSourceLoad(e4, t4, n2)
        openOnMount: boolean,
        slide: number,
        slideDistance: number,
        sourceMargin: number,
        sources: Array<string | React.JSX.Element>,
        toggler: boolean,
        types: Array<any>,
        videosPosters: Array<any>
    },
    resolve: (t: any) => any,
    sourcePointerProps: {
        downscreenX: number,
        isPointering: boolean,
        isSourceDownEventTarget: boolean,
        swipedX: number
    },
    stageIndexes: {
        current: number,
        previous: number
    }
};



function isFullLightboxInstance(instance: FSLightbox): instance is FSLightboxInstance {
    if(Object.hasOwn(instance, 'elements')) {
        const elems = (instance as FSLightboxInstance).elements;
        if(elems && Object.hasOwn(elems, 'container') && elems.container instanceof HTMLDivElement)
            return true;
    }
    return false;
}



type LightboxCaptionsOverlayProps = {
    sources: HTMLElement[],
    captions: LightboxCaptions,
    open: boolean,
    container: HTMLElement | null,
    activeIndex: number | undefined,
    divRef: React.RefObject<HTMLDivElement | null>,
};

type LightboxCaptionsOverlayHandle = {
    // activateCaption: (index: number | undefined) => void,
    // activateCaptionDebounced: ReturnType<typeof useThrottledDebounce<(index: number | undefined) => void>>,    
};

// type JSXElement = React.JSX.Element;

type LightboxCaptionHandle = /*React.Ref<HTMLDivElement>*/ & {
    setFocused: (active: boolean) => void,
    // setActive: (active: boolean) => void,
};

type LightboxCaptionProps = React.ComponentPropsWithoutRef<'div'> & {
    index: number,
    activeIndex: number | undefined,
    sourceElem: HTMLElement,
    divRef: React.RefObject<HTMLDivElement | null>,
} & WithRequired<React.RefAttributes<LightboxCaptionHandle>, 'ref'>;

function LightboxCaption({ref, children, divRef, sourceElem, className, index, activeIndex, ...props}: LightboxCaptionProps) {
    const [focused, setFocused] = React.useState<boolean>(false);
    const active = React.useMemo(()=>index===activeIndex, [activeIndex, index]);
    // const [active, setActive] = React.useState<boolean>(false);

    React.useImperativeHandle(ref, () => ({
        setFocused//, setActive
    }), []);

    // console.log(index, activeIndex, active);

    const activated = React.useRef<boolean | undefined>(undefined);
    React.useLayoutEffect(()=>{
        const div = divRef.current;
        if(!div) return;
        if(active === activated.current) return;
        gsap.killTweensOf(div);
        // const quickSet = gsap.quickSetter(div, "visibility");
        activated.current = undefined;
        if(active) {
            gsap.set(div, {'visibility': 'visible'});
            gsap.to(div, {
                opacity: 70,
                // delay: 0.5,
                delay: 0,
                duration: 0.8,
                // onStart: ()=>{
                //     quickSet('visible');
                //     activated.current = undefined;
                // },
                onComplete: ()=>{
                    activated.current = true;
                }
            });
        } else {
            activated.current = undefined;
            gsap.to(div, {
                opacity: 0,
                delay: 0,
                duration: 0.5,
                onStart: () => {
                },
                onComplete: ()=>{
                    // quickSet('hidden');
                    gsap.set(div, {'visibility': 'hidden'});
                    activated.current = false;
                }
            });
        }
        return ()=>gsap.killTweensOf(div);
    }, [active]);


    return <div ref={divRef} className={cn(
        'absolute w-full bottom-0 max-h-[30%] hover:max-h-min text-muted-foreground hover:text-foreground pointer-events-auto bg-background hover:opacity-100',
        focused ? 'current-caption overflow-y-scroll' : 'overflow-y-hidden',
        className,
        )} {...props}
        style={{visibility: 'hidden'}}
        data-index={index}
        data-active-index={activeIndex}
        data-item-active={active}
        data-item-focused={focused}    
    >
        {children}
    </div>;
}

type LightboxCaptionElem = React.ReactElement<LightboxCaptionProps, typeof LightboxCaption>;
const LightboxCaptionsOverlay = (({sources, captions, open, ref, divRef, activeIndex, container}: LightboxCaptionsOverlayProps & React.RefAttributes<LightboxCaptionsOverlayHandle>) => {

    const captionElemRefs = React.useRef<React.RefObject<HTMLDivElement | null>[]>([]);
    captionElemRefs.current = sources.map((el,i)=>captionElemRefs.current[i] ?? React.createRef());

    const captionHandleRefs = React.useRef<React.RefObject<LightboxCaptionHandle | null>[]>([]);
    captionHandleRefs.current = sources.map((el, i) => captionHandleRefs.current[i] ?? React.createRef());

    // const captionElemMap: Record<number, LightboxCaptionElem | null> = useMemo(()=>{
    //     const pairs: [number, LightboxCaptionElem | null][] = sources.map((elem, i) => {
    //         const caption = captions[i];
    //         if(!caption) {
    //             captionElemRefs.current[i].current = null;
    //             captionHandleRefs.current[i].current = null;
    //             return null;
    //         }
    //         const inner = (typeof caption === 'string') ? <p>{caption}</p> : caption;
    //         return [i, <LightboxCaption index={i} key={i} activeIndex={activeIndex} divRef={captionElemRefs.current[i]} sourceElem={elem} ref={captionHandleRefs.current[i]}>{inner}</LightboxCaption>]
    //     }) as [number, LightboxCaptionElem | null][];
    //     return Object.fromEntries(pairs);
    // }, [sources, captions]);

    // const captionElems = useMemo(()=>Object.values(captionElemMap)/*.filter(x => x !== null)*/, [captionElemMap]);

    // const captionElems = React.useMemo(
    //     ()=>sources.map((elem,i)=>{
    //         const caption = captions[i];
    //         if(!caption) {
    //             captionElemRefs.current[i].current = null;
    //             captionHandleRefs.current[i].current = null;
    //             return null;
    //         }
    //         const inner = (typeof caption === 'string') ? <p>{caption}</p> : caption;
    //         return <LightboxCaption index={i} key={i} activeIndex={activeIndex} divRef={captionElemRefs.current[i]} sourceElem={elem} ref={captionHandleRefs.current[i]}>{inner}</LightboxCaption>;
    //     }), [sources]);

     const captionElems = sources.map((elem,i)=>{
        const caption = captions[i];
        if(!caption) {
            captionElemRefs.current[i].current = null;
            captionHandleRefs.current[i].current = null;
            return null;
        }
        const inner = (typeof caption === 'string') ? <p>{caption}</p> : caption;
        return <LightboxCaption index={i} key={i} activeIndex={activeIndex} divRef={captionElemRefs.current[i]} sourceElem={elem} ref={captionHandleRefs.current[i]}>{inner}</LightboxCaption>;
    });

    // const activeCaptionElemRef = React.useRef<HTMLDivElement | null>(null);
    // const activeCaptionHandleRef = React.useRef<LightboxCaptionHandle | null>(null);
    // const activateCaption = React.useCallback((index: number | undefined) => {
    //     const nextElem = undefined === index ? null : (captionElemRefs.current[index - 1]?.current ?? null);
    //     const prevElem = activeCaptionElemRef.current === nextElem ? null : activeCaptionElemRef.current;
        
    //     console.log('Activate caption:', index??0 - 1, prevElem, nextElem);
    //     if(!(prevElem || nextElem)) return; // TODO: Don't reset throttle/debounce timeouts?
        
    //     if(prevElem) {
    //         const prevHandle = activeCaptionHandleRef.current; // ?? captionHandleRefs.current[prevElem.props.index];
    //         // if(prevHandle) prevHandle.setActive(false);
    //     }

    //     if(nextElem) {
    //         const nextHandle = captionHandleRefs.current[index! - 1]?.current;
    //         if(nextHandle) {
    //             // nextHandle.setActive(true); // TODO: Batch with prevHandle deactivate?
    //             activeCaptionElemRef.current = nextElem;
    //             activeCaptionHandleRef.current = nextHandle;
    //         }
    //     }
    //     activeCaptionElemRef.current = null;
    //     activeCaptionHandleRef.current = null;
    // }, []);

    // const activateCaptionDebounced = useThrottledDebounce(activateCaption, 75, 500);

    // React.useImperativeHandle(ref, ()=>({
    //     activateCaption, activateCaptionDebounced
    // }), [activateCaption, activateCaptionDebounced]);

    
    // React.useEffect(()=>{
    //     activateCaption(activeIndex);
    // }, [activeIndex, activateCaption]);

    // console.log('sources:', sources);


    const opened = React.useRef<boolean | undefined>(undefined);
    React.useEffect(()=>{
        const div = divRef.current;
        if(!div) return;
        if(open === opened.current) return;
        opened.current = undefined;
        gsap.killTweensOf(div);
        if(open) {
            gsap.set(div, {visibility: 'visible'});
            gsap.to(div, {
                opacity: 100,
                onComplete: () => {
                    opened.current = true;
                }
            });
        } else {
            gsap.to(div, {
                opacity: 0,
                onComplete: ()=>{
                    gsap.set(div, {visibility: 'hidden'});
                    opened.current = false;
                }
            });
        }
        return () => {
            gsap.killTweensOf(div);
        }
    }, [open]);


    if(!sources.length) return null;

    // console.log(captionElems, captionElemRefs.current, captionHandleRefs.current);


    const ret = createPortal(<div ref={divRef} className="lightbox-captions z-1000000001 absolute bottom-0 h-full w-full pointer-events-none overflow-visible pb-8">
        <div className="m-0 p-0 relative inset-0 h-full w-full">
            {captionElems}
        </div>
    </div>,
        document.body,
        // container,
        'lb-captions-portal'
    );

    return ret;
});



type CaptionedLightboxProps = {
    sourceKey?: string,
    sources?: LightboxSources;
    captions?: LightboxCaptions;
    open: boolean;
    openRef: React.RefObject<boolean>;
    // setOpen: (value: boolean) => void | React.Dispatch<React.SetStateAction<boolean>>;
    initialSlide?: number;
    onClose?: () => void;
};


interface CaptionedLightboxHandle {
    func?: () => void
}


export function CaptionedLightbox({
    openRef,
    sourceKey,
    sources,
    captions,
    open,
    initialSlide,
    onClose,
    ref
}: CaptionedLightboxProps & React.RefAttributes<CaptionedLightboxHandle>) {
    const [toggler, setToggler] = React.useState(false);
    const snRef = React.useRef<HTMLSpanElement | null>(null);

    useUnmount(()=>{
        openRef.current = false;
    });

    React.useEffect(()=>{
        gsap.registerPlugin(Flip);
    }, []);

    
    // Sync the open prop to toggler state
    React.useEffect(() => {
        console.log('LIGHTBOX OPEN:', open);
        if(open) setToggler(prev => !prev);
    }, [open]);
    const [captionSlide, setCaptionSlide] = React.useState<number | undefined>(undefined);
    
    const captionsHandleRef = React.useRef<LightboxCaptionsOverlayHandle>(null);
    useLightboxSlideObserver(snRef, captionSlide, setCaptionSlide, captionsHandleRef);
    const sourceElems = React.useRef<(HTMLElement | HTMLImageElement)[]>([]);
    const captions_ = React.useMemo(()=>captions?.length && captions.some(x => x) ? captions : null, [captions, toggler]);
    const containerRef = React.useRef<HTMLElement>(null);

    const captionDivRef = React.useRef<HTMLDivElement | null>(null);
    
    // React.useEffect(()=>{
    //     const captionsHandle = captionsHandleRef.current;
    //     if(!captionsHandle) return;
    //     if(toggler && captionSlide !== undefined) {
    //         // captionsHandle.activateCaptionDebounced.cancel()
    //         captionsHandle.activateCaption(undefined);
    //         captionsHandle.activateCaptionDebounced(captionSlide);
    //     } else {
    //         captionsHandle.activateCaptionDebounced.cancel();
    //         captionsHandle.activateCaption(undefined);
    //     }
    // }, [captionSlide, toggler]);

    const [activeCaptionIndex, setActiveCaptionIndex] = React.useState<number | undefined>(undefined);

    const prelimFn = React.useCallback((index: number | undefined) => {
        console.log(`prelimFn(${index}): setActiveCaptionIndex(undefined), returning:`, undefined === index)
        setActiveCaptionIndex(undefined);
        return (undefined === index);
    }, []);
    const opts = React.useMemo(()=>({
        prelim: prelimFn
    }), [prelimFn]);
    const setActiveCaptionIndexDebounced = useThrottledDebounce(setActiveCaptionIndex as ((value: number | undefined) => void), 150, 500, opts);

    React.useEffect(()=>{
        if(open && captionSlide !== undefined) {
            console.log(`Calling setActiveCaptionIndexDebounced(${captionSlide})`);
            setActiveCaptionIndexDebounced(captionSlide);
        } else {
            console.log(`Cancelling then calling setActiveCaptionIndexDebounced(${captionSlide})`);
            setActiveCaptionIndexDebounced.cancel();
            setCaptionSlide(undefined);
            setActiveCaptionIndex(undefined);
        }
    }, [captionSlide, open]);

    
    // Only render FSLightbox if we have sources
    if (!sources || sources.length === 0) {
        containerRef.current = null;
        captionsHandleRef.current = null;
        return null;
    }

    return <>
        <FSLightbox
            key={sourceKey}
            toggler={toggler}
            sources={sources}
            slide={initialSlide}
            onOpen={(instance)=>{ // Every open
                console.log('OPENED LIGHTBOX');
                openRef.current = true;
                setCaptionSlide(initialSlide);
                setActiveCaptionIndex(initialSlide);
                if(isFullLightboxInstance(instance)) {
                    sourceElems.current = instance.elements.sources;
                    containerRef.current = instance.elements.container;

                    const sns = instance.elements.container.getElementsByClassName('fslightboxsn');
                    if(sns.length && sns[0]?.firstElementChild instanceof HTMLSpanElement) {
                        snRef.current = sns[0].firstElementChild;
                        return;
                    }
                }
                snRef.current = null;
                containerRef.current = null;
                sourceElems.current = [];
            }}
            onClose={(_instance) => { // Every close
                console.log('CLOSED LIGHTBOX');
                openRef.current = false;
                setCaptionSlide(undefined);
                setActiveCaptionIndexDebounced(undefined);
                onClose?.();
                containerRef.current = null;
                captionsHandleRef.current = null;
            }}
            openOnMount={false}
            // onInit={instance=>{ // Initial open only
            //     console.log('On init:', instance);
            //     lbRef.current = instance;
            // }}
            // onShow={(instance)=>{ // Non-initial open
            //     console.log('On show:', instance);
            // }}
            exitFullscreenOnClose={true}
        />
        {captions_ && sourceElems.current?.length && <LightboxCaptionsOverlay divRef={captionDivRef} activeIndex={!open || activeCaptionIndex === undefined ? undefined : (activeCaptionIndex - 1)} container={containerRef.current} ref={captionsHandleRef} open={open} sources={sourceElems.current} captions={captions_}></LightboxCaptionsOverlay>}
    </>;
}
