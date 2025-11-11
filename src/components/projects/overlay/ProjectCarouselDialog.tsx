import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type Dispatch, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent, type ReactElement, type ReactNode, type SetStateAction } from "react";
import type {EmblaCarouselType, EmblaOptionsType} from "embla-carousel";

import {createPortal} from "react-dom";
import type { ProjectData, ProjectInfo } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {Button} from "@/components/ui/button";

import {gsap} from 'gsap';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "./TransparentDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { XIcon } from "lucide-react";



type CarouselContentItem = {
  children?: ReactNode[],
  props: {
    ['data-project-id']: string,
  }
} & ReactNode;

type ProjectCarouselProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  startIndex?: number | undefined;
//   slides: ReactNode[];
//   setSlides: Dispatch<SetStateAction<ReactNode[]>>;
  projects: ProjectInfo[];
  activeProjectId: string | undefined;
  activeProjectIndex: number | null;
  setActiveProjectIndex: Dispatch<SetStateAction<number | null>>;

    openedProjectId: string | null;
    setOpenedProjectId: Dispatch<SetStateAction<string | null>>;

  contentElements: CarouselContentItem[];
//   items: (ReactElement | HTMLElement)[];
//   initialIndex?: number;
} & React.ComponentProps<"div">;

// type CarouselOptions = { 
//     slides: (ReactElement)[];
// }

// type CarouselContentRecord = Record<string, CarouselContentItem>;

// function renderCarouselSlide(data: ProjectData): ReactNode {
// }

export default function ProjectCarouselDialog({ startIndex, open, setOpen, activeProjectId, openedProjectId, setOpenedProjectId, projects: visibleProjects, contentElements, activeProjectIndex, setActiveProjectIndex}: ProjectCarouselProps) {
  // console.log('Children:', children);

  // if (!open) return null;

  const backdropRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // const [options, setOptions] = useState<EmblaOptionsType>({loop: false})
  const options = useMemo<EmblaOptionsType>(() => ({startIndex}), [startIndex]);
  // const options = useRef<EmblaOptionsType>({});
  // const updateOptions = useCallback((newIndex: number | null) => {
  //   const newIndex_ = newIndex ?? undefined;
  //   if(options.current?.startIndex !== newIndex_)
  //     options.current = {...options.current, startIndex: newIndex_};
  // }, [options]);

  // const options_current = useMemo(()=>options.current, [options.current, options]);
  const [emblaRef, embla] = useEmblaCarousel(options);
  // const allSlides = useMemo(()=>Object.fromEntries(contentElements.map(elem=>[elem.props["data-project-id"], elem])), [contentElements]);
  const allSlides = Object.fromEntries(contentElements.map(elem=>[elem.props["data-project-id"], elem]));
  // const [storedOpen, setStoredOpen] = useState<boolean>(false);


  // console.log('allSlides:', allSlides);

  // const slides = useMemo(() => visibleProjects.map((p)=>allSlides[p.id]), [visibleProjects, allSlides]);
  const slides = visibleProjects.map((p)=>allSlides[p.id]);


  // Call this when opening the carousel
  // const openCarousel = useCallback((items: React.ReactNode[]) => {
  //   setSlides(items);     // set items/slides
  //   setOpen(true);        // open the modal
  // }, [setOpen]);



  // if (!open || !slides) return null;

  const onSelect = useCallback((emblaApi: EmblaCarouselType | undefined) => {
    console.log('onSelect', activeProjectIndex, openedProjectId, emblaApi ? {
      scrollSnap: emblaApi.selectedScrollSnap(),
      prevSnap: emblaApi.previousScrollSnap(),
      emblaApi
    } : undefined);
    if(!emblaApi) return;
    // emblaApi.slideNodes;
    // emblaApi.scrollProgress;
    // console.warn('EMBLA API onSelect:', emblaApi.selectedScrollSnap())
    const index = emblaApi.selectedScrollSnap();
    console.log('Setting activeProjectIndex:', index, activeProjectIndex, openedProjectId);
    setActiveProjectIndex(index);  // This should also update opened project id
    if(activeProjectId !== null && activeProjectId !== undefined && openedProjectId === null)
      setOpenedProjectId(activeProjectId);
  }, [activeProjectIndex, setActiveProjectIndex, activeProjectId, openedProjectId, setOpenedProjectId]);  


  
  // const onEmblaReInit = useCallback((emblaApi: EmblaCarouselType | undefined) => {
  //   if(!emblaApi) return;
  //   console.log('On reInit:', activeProjectIndex, emblaApi.selectedScrollSnap());
  //   if(activeProjectIndex !== null) {
  //     // if(activeProjectIndex !== emblaApi.selectedScrollSnap())
  //       // shouldCheckScroll.current= true;
  //     // console.log(visibleProjects, emblaApi.slideNodes(), slides);
  //     // console.log('(init/reInit) Scrolling to index:', activeProjectIndex)
  //     // console.log(emblaApi.scrollTo);
  //     // emblaApi.scrollTo(activeProjectIndex, true);
  //     // requestAnimationFrame(()=>{emblaApi.scrollTo(activeProjectIndex, true)});
  //   }

  // }, [activeProjectIndex, embla]);



  // useEffect(() => {
  //   if (embla && slides.length > 0) {
  //     embla.reInit();
  //     if(activeProjectIndex !== null)
  //       embla.scrollTo(activeProjectIndex, false);
  //   }
  // }, [embla, slides, activeProjectIndex]);


  // useEffect(() => {
  //   // console.log('Using effect', embla, onSelect);
  //   if(!embla) return;
  //   embla
  //   .on('init', onEmblaReInit).on('reInit', onEmblaReInit);
  //   return () => { 
  //     embla
  //       .off('init', onEmblaReInit)
  //       .off('reInit', onEmblaReInit)
  //       // .off('select', onSelect) 
  //   };
  // }, [embla, onEmblaReInit]);


  useEffect(() => {
    if(!embla) return;
    if(activeProjectIndex !== null && activeProjectIndex !== embla.selectedScrollSnap()) {
      const slideNodes = embla.slideNodes();
      console.log(visibleProjects, slideNodes, slides);
      // const engine = embla.internalEngine();
      embla.scrollTo(activeProjectIndex, true);
    }
  }, [embla]);


  // const handleStoredOpenChanged = useEffectEvent((open_: boolean) => {
  //   console.log('storedOpen changed:', open_, storedOpen, open)
  //    if(open_) {
  //     console.assert(activeProjectId);
  //     const activeId = activeProjectId;
  //     if(activeId) setOpenedProjectId(activeId);
  //   } else {
  //     setOpenedProjectId(null);
  //   }
  // });

  // useEffect(()=>{
  //   handleStoredOpenChanged(storedOpen);
  // }, [storedOpen]);

  const handleOpenChange = useEffectEvent((open_: boolean, embla: EmblaCarouselType | undefined) => {
    console.log('carouselOpen changed:', open_, open, activeProjectIndex); // , storedOpen);
    // setStoredOpen(open_);
    if(!embla) return;
    if(open) {
      if(activeProjectIndex !== null) {
        console.log('(handleOpenChange) Scrolling to index:', activeProjectIndex)
        embla.scrollTo(activeProjectIndex, true);
        // updateOptions(activeProjectIndex);
        // setOpenedProjectId(activeProjectId ?? null);
      }
    }
  });


  useEffect(()=> {
    handleOpenChange(open, embla);
  }, [open, embla, visibleProjects]);

//   const onOpenChange = useCallback((open: boolean) => {
//     console.log('ON OPEN CHANGE', open);
//     // if(open) {
//     //   // activeProjectIndex should already be set
//     //   setOpenedProjectId(activeProjectId ?? null);
//     // } else {
//     //   setOpenedProjectId(null);
//     // }
//     // console.log('Setting carousel open:', open, activeProjectId);
//     setOpen(open);
//   }, [setOpen]);

// //   useEffect(() => {
//     // if(!embla) return;
//     const carouselDiv = carouselRef.current;
//     const backdropDiv = backdropRef.current;
//     if(!backdropDiv || !carouselDiv) return;
    
//     if(open) {
//       // if(embla && embla.selectedScrollSnap() !== activeProjectIndex) embla.scrollTo(activeProjectIndex, false);
//       // console.log('Animating "to" visible')
//       gsap.to([carouselDiv, backdropDiv], {
//         opacity: 1.0, duration: 0.3, visibility: 'visible',
//         onStart: () => {
//           gsap.set([carouselDiv, backdropDiv], {
//             visibility: 'visible'
//           })
//         }
//       });
//     } else { // TODO: Only if visible
//       // setOpenedProjectId(null);
//       // console.log('Animating "to" hidden')
//       gsap.to([carouselDiv, backdropDiv], {
//         opacity: 0.0, duration: 0.3,
//         onComplete: () => {
//           gsap.set([carouselDiv, backdropDiv], {
//             visibility: 'hidden'
//           })
//         }
//       })
//     }
//   }, [open, embla, activeProjectIndex]);

  const noPropagate = (e: PointerEvent | RPointerEvent<HTMLButtonElement | HTMLDivElement>) => {
    // console.log('No propagate:', e);
    e.stopPropagation();
    // e.preventDefault();
  };

  // const noPropagate2 = (ev: PointerEvent) => {
  //   // console.log('No propagate 2:', ev, ev.target, ev.currentTarget, ev.relatedTarget);
  //   const target = (ev.target ? (ev.target as HTMLElement) : null);
  //   ev.preventDefault();
  //   ev.stopImmediatePropagation();
  //   ev.stopPropagation();
  // };
  // const noPropagate2Opts = {
  //   capture: true,
  //   once: false,
  //   passive: false
  // };

  // const logEvent = (e: RMouseEvent | RPointerEvent<HTMLButtonElement>) => {
  //   console.log('Event:', e);
  // };

  // useEffect(() => {
  //   const prev = prevRef.current, next = nextRef.current, overlay = overlayRef.current;

  //   if(prev || next || overlay) {
  //     prev?.addEventListener('pointerdown', noPropagate2, noPropagate2Opts);
  //     next?.addEventListener('pointerdown', noPropagate2, noPropagate2Opts);
  //     overlay?.addEventListener('pointerdown', noPropagate2, noPropagate2Opts);

  //     return () => {
  //       prev?.removeEventListener('pointerdown', noPropagate2, noPropagate2Opts);
  //       next?.removeEventListener('pointerdown', noPropagate2, noPropagate2Opts);
  //       overlay?.removeEventListener('pointerdown', noPropagate2, noPropagate2Opts);
  //     };
  //   }
  // });

  return <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <DialogPortal container={document.getElementById('modal-root')}>
            {/* <div id='dialog-wrapper' className="fixed p-0 m-0 inset-0 z-40 bg-transparent border-none shadow-none w-full h-full"> */}
            {/* Backdrop */}

            {/* Carousel */}
            <DialogContent className="border-0 shadow-none p-0 m-0 items-center justify-center focus:outline-none z-50 flex w-full h-full inset-0 pointer-events-none" 
                        // className="bg-transparent border-0 shadow-none p-0 fixed inset-0 z-50 flex items-center justify-center focus:outline-none"
                        aria-describedby={undefined} 
                        // onPointerDownCapture={noPropagate} onMouseDownCapture={logEvent} onMouseDown={logEvent} onPointerDown={logEvent} onAuxClick={logEvent} onAuxClickCapture={logEvent} onClickCapture={logEvent} onClick={logEvent} onGotPointerCapture={logEvent} onGotPointerCaptureCapture={logEvent}
                                  onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            let closest;
            console.log('Checking closest...');
            if (closest = target.closest('[data-carousel-control]')) {
              console.log('Closest:', closest);
              e.preventDefault(); // tell Radix not to close
        }}}
            >
                <DialogOverlay ref={overlayRef} className="fixed p-0 m-0 inset-0 z-40 bg-black/40 backdrop-blur-sm"
                 onClick={()=>setOpen(false)} onPointerDownCapture={noPropagate} onPointerDown={noPropagate}></DialogOverlay>
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>Dialog Title</DialogTitle>
                    </DialogHeader>
                </VisuallyHidden>
                {/* <div className="relative z-60 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}> */}
                <Carousel ref={emblaRef} className="overflow-visible z-60 pointer-events-visible" onCarouselSelect={onSelect}>  
                    {/* // className="w-full max-w-3xl h-[70vh]" */}
                    <CarouselContent className="overflow-visible pointer-events-visible">
                        {slides.map((slide, i) => (
                            <CarouselItem key={i} className="pointer-events-visible">
                            {/* // <div className="p-1"> */}
                            <Card className="relative w-full-[35vw] flex pointer-events-visible">
                                {/* <Button
                                  onClick={(evt) => {setOpen(false); evt.preventDefault(); }}
                                // className="absolute top-4 right-4 text-white text-2xl"
                                // >
                                // ✕
                                // </Button>
                                  className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                                >
                                    <XIcon />
                                    <span className="sr-only">Close</span>
                                </Button> */}
                                {/* <CardContent className="flex aspect-square items-center justify-center p-6"> */}
                                <CardHeader>
                                <CardTitle>Title</CardTitle>
                                </CardHeader>
                                <CardContent className="pointer-events-visible">
                                {slide}
                                </CardContent>
                            </Card>
                            {/* // </div> */}
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious ref={prevRef} className='disabled:pointer-events-auto'/> 
                    {/* onPointerDownCapture={noPropagate} onMouseDownCapture={logEvent} onMouseDown={logEvent} onPointerDown={logEvent} onAuxClick={logEvent} onAuxClickCapture={logEvent} onClickCapture={logEvent} onClick={logEvent} onGotPointerCapture={logEvent} onGotPointerCaptureCapture={logEvent}/> */}
                    <CarouselNext ref={nextRef} className='disabled:pointer-events-auto'/> 

                    <CarouselDots></CarouselDots>
                     {/* onPointerDownCapture={noPropagate} /> */}
                </Carousel>
                {/* </div> */}
        </DialogContent>

        {/* </div> */}
        </DialogPortal>
    </Dialog>;
}