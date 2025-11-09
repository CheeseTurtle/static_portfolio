import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactElement, type ReactNode, type SetStateAction } from "react";
import type {EmblaCarouselType, EmblaOptionsType} from "embla-carousel";

import {createPortal} from "react-dom";
import type { ProjectData } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {Button} from "@/components/ui/button";

import {gsap} from 'gsap';

type CarouselContentItem = {
  children?: ReactNode[],
  props: {
    ['data-project-id']: string,
  }
} & ReactNode;

type ProjectCarouselProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
//   slides: ReactNode[];
//   setSlides: Dispatch<SetStateAction<ReactNode[]>>;
  projects: ProjectData[];
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

type CarouselContentRecord = Record<string, CarouselContentItem>;



// function renderCarouselSlide(data: ProjectData): ReactNode {
// }

export default function ProjectCarousel({ open, setOpen, openedProjectId, setOpenedProjectId, projects: visibleProjects, contentElements, activeProjectIndex, setActiveProjectIndex}: ProjectCarouselProps) {
  // console.log('Children:', children);

  // if (!open) return null;

  const backdropRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState<EmblaOptionsType>({loop: false})
  const [emblaRef, embla] = useEmblaCarousel(options);
  const allSlides = Object.fromEntries(contentElements.map(elem=>[elem.props["data-project-id"], elem]));

  // console.log('allSlides:', allSlides);

  const slides = useMemo(() => visibleProjects.map((p)=>allSlides[p.id]), [visibleProjects]);

  // Call this when opening the carousel
  // const openCarousel = useCallback((items: React.ReactNode[]) => {
  //   setSlides(items);     // set items/slides
  //   setOpen(true);        // open the modal
  // }, [setOpen]);



  // if (!open || !slides) return null;

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    // emblaApi.slideNodes;
    // emblaApi.scrollProgress;
    console.warn('EMBLA API onSelect:', emblaApi.selectedScrollSnap())
    setActiveProjectIndex(emblaApi.selectedScrollSnap());
  }, [activeProjectIndex, setActiveProjectIndex]);  

  useEffect(() => {
    // console.log('Using effect', embla, onSelect)
    if(!embla) return;
    embla.on('select', onSelect);
    // return () => embla.off('select', onSelect);
  }, [embla, onSelect]);

  useEffect(() => {
    // if(!embla) return;
    const carouselDiv = carouselRef.current;
    const backdropDiv = backdropRef.current;
    if(!backdropDiv || !carouselDiv) return;
    
    if(open) {
      // if(embla && embla.selectedScrollSnap() !== activeProjectIndex) embla.scrollTo(activeProjectIndex, false);
      // console.log('Animating "to" visible')
      gsap.to([carouselDiv, backdropDiv], {
        opacity: 1.0, duration: 0.3, visibility: 'visible',
        onStart: () => {
          gsap.set([carouselDiv, backdropDiv], {
            visibility: 'visible'
          })
        }
      });
    } else { // TODO: Only if visible
      // setOpenedProjectId(null);
      // console.log('Animating "to" hidden')
      gsap.to([carouselDiv, backdropDiv], {
        opacity: 0.0, duration: 0.3,
        onComplete: () => {
          gsap.set([carouselDiv, backdropDiv], {
            visibility: 'hidden'
          })
        }
      })
    }
  }, [open, embla, activeProjectIndex]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div id="carousel-backdrop" ref={backdropRef}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      {/* Carousel */}
      <div id='carousel-container' className="fixed inset-0 z-50 flex items-center justify-center p-4" ref={carouselRef}>

        <Carousel ref={emblaRef} className="w-full max-w-3xl h-[70vh]">
          <CarouselContent>
              {slides.map((slide, i) => (
                <CarouselItem key={i}>
                {/* // <div className="p-1"> */}
                  <Card className="relative w-full-[35vw]">
                    <Button
                      className="absolute top-4 right-4 text-white text-2xl"
                      onClick={(evt) => {setOpen(false); evt.preventDefault(); }}
                    >
                      ✕
                    </Button>
                    {/* <CardContent className="flex aspect-square items-center justify-center p-6"> */}
                    <CardHeader>
                      <CardTitle>Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {slide}
                    </CardContent>
                  </Card>
                {/* // </div> */}
                  </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </>,
    document.getElementById("modal-root")!
  );
};

//   const setSlides = useCallback((slides: any[]) => {
//     setOptions((currentOptions) => ({
//         ...currentOptions,
//         slides: slides
//     }));
//   }, [])

//   return (
//     <>
//       <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <button
//           className="absolute top-4 right-4 text-white text-2xl"
//           onClick={() => setOpen(false)}
//         >
//           ✕
//         </button>

//         <Carousel className="w-full max-w-3xl h-[70vh]">
//           {items.map((item, i) => (
//             <CarouselItem key={i}>{item}</CarouselItem>
//           ))}
//         </Carousel>
//       </div>
//     </>
//   );
// }
