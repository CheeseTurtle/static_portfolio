import React, { useCallback, useMemo, useReducer } from "react";
import FSLightbox from "fslightbox-react";
import { createPortal } from "react-dom";
import type { ProjectInfo } from "./types";
import useMutationObserver from "@/hooks/use-mutation-observer";
import { useDomReady } from "@/hooks/use-dom-ready";
import { LightboxContext, lightboxReducer, type LightboxCaptions, type LightboxSources } from "./lightbox";

import {Flip} from "gsap/Flip";
import {gsap} from "gsap";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import useThrottledDebounce from "@/hooks/useThrottledDebounce";
import { cn } from "@/lib/utils";
import type { WithRequired } from "node_modules/astro/dist/type-utils";

type CaptionedLightboxProps = {
    initialSlide: number,
    sources: LightboxSources;
    captions?: LightboxCaptions; // Array<string | React.ReactNode>; // HTML or JSX
    open: boolean;
    onClose?: () => void;
};

export function CaptionedLightboxProvider({children, onClose}: {children: React.ReactNode, onClose?: () => void}) {
    const [state, dispatch] = useReducer(lightboxReducer, {captions: [], initialSlide: 0, open: false, sources: [] });
    // const {captions, sources, open} = state;

    const onClose_ = useCallback(()=>{
        dispatch({type: 'CLOSE'});
        onClose?.();
    }, [onClose, dispatch]);

    return <LightboxContext.Provider value={{
        state, dispatch
    }}>
        <CaptionedLightbox {...state} onClose={onClose_}></CaptionedLightbox>
        {children}
    </LightboxContext.Provider>;
}


interface CaptionedLightboxHandle {
    func?: () => void
}


function useLightboxSlideObserver(snRef: React.RefObject<HTMLSpanElement | null>, captionSlide: number | undefined, setCaptionSlide: React.Dispatch<React.SetStateAction<number | undefined>>, overlayRef: React.RefObject<LightboxCaptionsOverlayHandle | null>) {
    // div.fslightbox-container.fslightbox-full-dimension
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
        // lastMutation.removedNodes[0]
        const addedNode = (lastMutation.addedNodes[0] as Text);
        if(!addedNode.data) return;
        const numVal = Number(addedNode.data);
        if(numVal === captionSlideRef.current) return;
        
        if(isNaN(numVal)) return;

        // Debounced & throttled transition to new caption

        setCaptionSlideRef.current?.(numVal);
    }, []);

    // console.log('snRef:', snRef);
    if(snRef.current) console.log(captionSlide, captionSlideRef.current);

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
    toggler: boolean,
    container: HTMLElement | null
};

type LightboxCaptionsOverlayHandle = {
    activateCaption: (index: number | undefined) => void,
    activateCaptionDebounced: ReturnType<typeof useThrottledDebounce<(index: number | undefined) => void>>,    
};

// type JSXElement = React.JSX.Element;

type LightboxCaptionHandle = /*React.Ref<HTMLDivElement>*/ & {
    fitToElement: (elem: HTMLElement) => void,
    setActive: (active: boolean) => void,
};

type LightboxCaptionProps = React.ComponentPropsWithoutRef<'div'> & {
    index: number,
    // active: boolean,
    // sourceRef: React.RefObject<HTMLDivElement | null>,
    sourceElem: HTMLElement,
    divRef: React.RefObject<HTMLDivElement | null>,
} & WithRequired<React.RefAttributes<LightboxCaptionHandle>, 'ref'>;

function LightboxCaption({ref, children, divRef, sourceElem, className, ...props}: LightboxCaptionProps) {
    const [active, setActive] = React.useState<boolean>(false);

    const fitToElement = React.useCallback((elem: HTMLElement) => {
        // const div = divRef.current;
        // if(!div) return;
        // gsap.killTweensOf(div);
        // const fit = Flip.fit(div, elem, {
        //     immediateRender: false,
        //     // absolute: true,
        //     // getVars: false,
        //     duration: 0,
        //     // delay: undefined,
        //     // ease: undefined,
        //     simple: true,
        //     // fitChild: undefined
        //     // snap: false,
        //     // stagger: false,
        //     // callbackScope: undefined,
        //     // enableBackground: false,
        //     // inertia: undefined
        
        // });
    }, [divRef]);
    React.useImperativeHandle(ref, () => ({
        fitToElement, setActive
    }), [fitToElement]);

    const fitToSource = React.useCallback(()=>{
        if(sourceElem?.isConnected) {
            fitToElement(sourceElem);
            return true;
        }
        return false;
    }, [sourceElem, fitToElement]);


    React.useEffect(()=>{if(active) fitToSource()}, [active, fitToSource]);

    return <div ref={divRef} className={cn(
        'absolute w-full bottom-0 max-h-[30%] hover:max-h-min text-muted-foreground hover:text-foreground pointer-events-auto bg-background opacity-70 hover:opacity-100 transition-all duration-75',
        active ? 'current-caption overflow-y-scroll' : 'overflow-y-hidden',
        className,
    )} {...props}>
        {children}
    </div>;
}




type LightboxCaptionElem = React.ReactElement<LightboxCaptionProps, typeof LightboxCaption>;
const LightboxCaptionsOverlay = (({sources, captions, toggler, ref, container}: LightboxCaptionsOverlayProps & React.RefAttributes<LightboxCaptionsOverlayHandle>) => {

    const captionElemRefs = React.useRef<React.RefObject<HTMLDivElement | null>[]>([]);
    captionElemRefs.current = sources.map((el,i)=>captionElemRefs.current[i] ?? React.createRef());

    const captionHandleRefs = React.useRef<React.RefObject<LightboxCaptionHandle | null>[]>([]);
    captionHandleRefs.current = sources.map((el, i) => captionHandleRefs.current[i] ?? React.createRef());

    const captionElemMap: Record<number, LightboxCaptionElem | null> = useMemo(()=>{
        const pairs: [number, LightboxCaptionElem | null][] = sources.map((elem, i) => {
            const caption = captions[i];
            if(!caption) {
                captionElemRefs.current[i].current = null;
                captionHandleRefs.current[i].current = null;
                return null;
            }
            const inner = (typeof caption === 'string') ? <p>{caption}</p> : caption;
            // return [i, <div ref={captionElemRefs.current[i]} className="lb-caption" key={i}>{inner}</div>];
            return [i, <LightboxCaption index={i} key={i} divRef={captionElemRefs.current[i]} sourceElem={elem} ref={captionHandleRefs.current[i]}>{inner}</LightboxCaption>]
        }) as [number, LightboxCaptionElem | null][];/*.filter(x=>x!==null) as [number, JSXElement][];*/
        return Object.fromEntries(pairs);
    }, [sources, captions]);

    const captionElems = useMemo(()=>Object.values(captionElemMap)/*.filter(x => x !== null)*/, [captionElemMap]);

    const activeCaptionElemRef = React.useRef<HTMLDivElement | null>(null);
    const activeCaptionHandleRef = React.useRef<LightboxCaptionHandle | null>(null);
    const activateCaption = React.useCallback((index: number | undefined) => {
        const nextElem = undefined === index ? null : (captionElemRefs.current[index - 1]?.current ?? null);
        const prevElem = activeCaptionElemRef.current === nextElem ? null : activeCaptionElemRef.current;
        
        console.log('Activate caption:', index??0 - 1, prevElem, nextElem);
        if(!(prevElem || nextElem)) return; // TODO: Don't reset throttle/debounce timeouts?
        
        if(prevElem) {
            const prevHandle = activeCaptionHandleRef.current; // ?? captionHandleRefs.current[prevElem.props.index];
            if(prevHandle)
                prevHandle.setActive(false);
        }

        if(nextElem) {
            const nextHandle = captionHandleRefs.current[index! - 1]?.current;
            if(nextHandle) {
                nextHandle.setActive(true); // TODO: Batch with prevHandle deactivate?
                activeCaptionElemRef.current = nextElem;
                activeCaptionHandleRef.current = nextHandle;
            }
        }
        activeCaptionElemRef.current = null;
        activeCaptionHandleRef.current = null;
    }, []);

    const activateCaptionDebounced = useThrottledDebounce(activateCaption, 150, 500);

    React.useImperativeHandle(ref, ()=>({
        activateCaption, activateCaptionDebounced
    }), [activateCaption]);

    console.log('sources:', sources);

    if(!sources.length) return null;

    console.log(captionElems, captionElemRefs.current, captionHandleRefs.current);

    const ret = createPortal(<div className="lightbox-captions z-1000000001 absolute bottom-0 h-full w-full pointer-events-none overflow-visible pb-8">
        <div className="container relative inset-0 h-full w-full">
            {captionElems}
        </div>
    </div>,
        document.body,
        // container,
        'lb-captions-portal'
    );

    return ret;
});

export function CaptionedLightbox({
    sourceKey,
    sources,
    captions,
    open,
    initialSlide,
    onClose,
}: {
    sourceKey?: string,
    sources?: LightboxSources;
    captions?: LightboxCaptions;
    open: boolean;
    initialSlide?: number;
    onClose?: () => void;
}) {
    const [toggler, setToggler] = React.useState(false);
    const lbRef = React.useRef<FSLightbox | null>(null);
    const snRef = React.useRef<HTMLSpanElement | null>(null);

    React.useEffect(()=>{
        gsap.registerPlugin(Flip);
    }, []);
    
    // Sync the open prop to toggler state
    React.useEffect(() => {
        if (open) {
            setToggler(prev => !prev); // Toggle to trigger FSLightbox
        }
    }, [open]);
    const [captionSlide, setCaptionSlide] = React.useState<number | undefined>(undefined);
    
    const captionsHandleRef = React.useRef<LightboxCaptionsOverlayHandle>(null);
    useLightboxSlideObserver(snRef, captionSlide, setCaptionSlide, captionsHandleRef);
    const sourceElems = React.useRef<(HTMLElement | HTMLImageElement)[]>([]);
    const captions_ = React.useMemo(()=>captions?.length && captions.some(x => x) ? captions : null, [captions, toggler]);
    const containerRef = React.useRef<HTMLElement>(null);

    
    React.useEffect(()=>{
        const captionsHandle = captionsHandleRef.current;
        if(!captionsHandle) return;
        if(toggler && captionSlide !== undefined) {
            // captionsHandle.activateCaptionDebounced.cancel()
            captionsHandle.activateCaption(undefined);
            captionsHandle.activateCaptionDebounced(captionSlide);
        } else {
            captionsHandle.activateCaptionDebounced.cancel();
            captionsHandle.activateCaption(undefined);
        }
    }, [captionSlide, toggler]);

    
    // Only render FSLightbox if we have sources
    if (!sources || sources.length === 0) {
        lbRef.current = null;
        return null;
    }


    console.log('CONTAINER:', containerRef.current);

    return <>
        <FSLightbox
            // ref={lbRef}
            key={sourceKey}
            toggler={toggler}
            sources={sources}
            slide={initialSlide}
            onOpen={(instance)=>{ // Every open
                setCaptionSlide(initialSlide);
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
                setCaptionSlide(undefined);
                containerRef.current = null;
                onClose?.();
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
        {toggler && captions_ && sourceElems.current?.length && <LightboxCaptionsOverlay container={containerRef.current} ref={captionsHandleRef} toggler={toggler} sources={sourceElems.current} captions={captions_}></LightboxCaptionsOverlay>}
    </>;
}






// export function MultiGalleryLightbox({ galleries }) {
//   const [state, dispatch] = React.useReducer(lightboxReducer, {
//     open: false,
//     galleryIndex: null,
//     slide: 1,
//   });

//   const activeGallery =
//     state.galleryIndex !== null ? galleries[state.galleryIndex] : null;

//   return (
//     <>
//       {galleries.map((g, gi) => (
//         <ImageRow
//           key={gi}
//           images={g.images}
//           onImageClick={(index) => {
//             dispatch({
//               type: "OPEN",
//               galleryIndex: gi,
//               slide: index + 1,
//             });
//           }}
//         />
//       ))}

//       {activeGallery && (
//         <CaptionedLightbox
//           open={state.open}
//           onClose={() => dispatch({ type: "CLOSE" })}
//           sources={activeGallery.images}
//           captions={activeGallery.captions}
//           slide={state.slide}
//           onSlideChange={(s) => dispatch({ type: "SET_SLIDE", slide: s })}
//         />
//       )}
//     </>
//   );
// }






// export function CaptionedLightbox({
//       sources,
//     //   captions,
//       initialSlide,
//     open,
//     onClose,
//     // ref,
// }: CaptionedLightboxProps & React.RefAttributes<CaptionedLightboxHandle>) {
//     //   const [toggler, setToggler] = React.useState(false);
//     //   const [slide, setSlide] = React.useState<number | undefined>(undefined);

//     //   const sources = React.useRef<LightboxSource[]>([]);
//     //   const captions = React.useRef<LightboxCaption[]>([]);

//     //   // Sync external `open` prop to the toggler
//     //   React.useEffect(() => {
//     //     setToggler(open);
//     //   }, [open]);

//     // const [state, dispatch] = useReducer(lightboxReducer, {captions: [], initialSlide: 0, open: false, sources: [] });

//     // const {initialSlide, open, sources} = state;

//     return (
//         <>
//             <FSLightbox
//                 toggler={open}
//                 sources={sources}
//                 slide={initialSlide}
//                 // customAttributes={}
//                 // onSlideChange={(instance) => setSlide(instance.props?.slide)}
//                 onClose={() => {
//                     // setToggler(false);   // ???
//                     onClose?.();
//                 }}
//             />

//             {/* {captions && open &&
//                 createPortal(
//                     <div
//                         className="
//               fixed bottom-8 left-1/2 -translate-x-1/2
//               z-999999
//               bg-black/65 backdrop-blur-sm
//               text-white text-sm leading-snug
//               max-w-[90vw]
//               px-4 py-2 rounded-lg
//               pointer-events-none
//             "
//                     >
//                         {typeof captions[slide - 1] === "string" ? (
//                             <div
//                                 dangerouslySetInnerHTML={{
//                                     __html: captions[slide - 1] as string,
//                                 }}
//                             />
//                         ) : (
//                             captions[slide - 1]
//                         )}
//                     </div>,
//                     document.body
//                 )} */}
//         </>
//     );
// }


// export function CaptionedLightbox({
//     sources,
//     // captions,
//     open,
//     initialSlide,
//     onClose,
// }: {
//     sources?: LightboxSources;
//     captions?: LightboxCaptions;
//     open: boolean;
//     initialSlide?: number;
//     onClose?: () => void;
// }) {
//     const [toggler, setToggler] = React.useState(false);
    
//     // Sync the open prop to toggler state
//     React.useEffect(() => {
//         if (open && sources && sources.length > 0) {
//             setToggler(prev => !prev); // Flip to trigger FSLightbox
//         }
//     }, [open, sources]);

//     // Always render FSLightbox, but with empty array if no sources
//     // This keeps hooks consistent
//     return (
//         <FSLightbox
//             toggler={toggler}
//             sources={sources && sources.length > 0 ? sources : ['']}
//             slide={initialSlide ?? 1}
//             onClose={() => {
//                 onClose?.();
//             }}
//         />
//     );
// }

