import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

import gsap from "gsap"


export type CarouselSliderProps = {
    // hovercardContents: React.ReactNode[],
    // getHovercardContentForIndex: (index: number)=>React.ReactNode,
    hovercards: React.JSX.Element[],
    numSlides: number,
} & React.ComponentProps<typeof SliderPrimitive.Root>;

export default function CarouselSlider({
    className,
    defaultValue,
    value,
    // getHovercardContentForIndex,
    hovercards,
    numSlides,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    onValueChange,
    ...props
}: CarouselSliderProps) {

    // const divARef = React.useRef<HTMLDivElement>(null);
    // const divBRef = React.useRef<HTMLDivElement>(null);

    const [sliderIndex_, setSliderIndex] = React.useState<number | undefined>(value?.[0] ?? undefined);

    const [hoverIndex, setHoverIndex] = React.useState<number | undefined>(undefined);

    const sliderIndex = React.useMemo(()=>hoverIndex ?? sliderIndex_, [sliderIndex_, hoverIndex]);
    
    const trackRef = React.useRef<HTMLDivElement>(null);
    
    const isDraggingRef = React.useRef(false)

    const onValueChange_ = React.useCallback((value: number[])=>{
      setSliderIndex(value[0]);
      setHoverIndex(undefined);
      onValueChange?.([value[0]]);
    }, [onValueChange]);
    
    const onPointerLeave: React.PointerEventHandler = React.useCallback((_evt) => {
      if (isDraggingRef.current) return
      setHoverIndex(undefined)
    }, []);

    // const onPointerEnter: React.PointerEventHandler = React.useCallback(()=>{

    // }, [])

    const hoverXRef = React.useRef<HTMLDivElement>(null)
    const [trackWidth, setTrackWidth] = React.useState(0)

    React.useLayoutEffect(() => {
      if (!trackRef.current) return
      setTrackWidth(trackRef.current.getBoundingClientRect().width)
    }, [])

    const onPointerOver: React.PointerEventHandler = React.useCallback((evt)=>{
      if (isDraggingRef.current) return
      // if(evt.buttons) return;
      // evt.nativeEvent.x
      // evt.nativeEvent.screenX
      // evt.nativeEvent.clientX
      // evt.nativeEvent.offsetX
      // evt.nativeEvent.movementX
      // evt.nativeEvent.pageX
      // evt.nativeEvent.layerX
      // // evt.nativeEvent.tiltX
      // evt.pageX
      // evt.screenX
      // evt.clientX
      // evt.movementX
      // // evt.tiltX

      // console.log('Track:', trackRef.current);
      // console.log('Range:', rangeRef.current);
      // console.log(evt);

      // if(!numSlides) return;
      
      // const track = trackRef.current;
      // if(!track) return;
      
      // const width = track.clientWidth;
      // if(!width) return;
      // const left = track.clientLeft;
      
      // const pos = evt.clientX;
      // const fracPos = Math.min(width, Math.max(0, (pos - left))) / width;
      
      // const max = numSlides - 1;
      // const fracIdx = fracPos * max;
      // const idx = Math.round(fracIdx);

      // setHoverIndex(idx);


      if (isDraggingRef.current) return
      if (!numSlides) return

      const track = trackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const x = evt.clientX - rect.left
      const fracPos = Math.min(1, Math.max(0, x / rect.width))

      const max = numSlides - 1
      const idx = Math.round(fracPos * max)

      setHoverIndex(idx)
    }, [numSlides])


    React.useEffect(() => {
      if (undefined === hoverXRef.current || !trackWidth || sliderIndex === undefined) return

      const ratio =
        numSlides <= 1 ? 0 : sliderIndex / (numSlides - 1)

      const targetX = ratio * trackWidth

      gsap.to(hoverXRef.current, {
        x: targetX,
        duration: 0.2,
        ease: "power3.out",
      })
    }, [sliderIndex, trackWidth, numSlides])


    if(!numSlides) return null;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={0}
      max={numSlides - 1}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      onValueChange={onValueChange_}
    //   onValueCommit={}
      {...props}
    >
      <HoverCard openDelay={0}>

        {/* <HoverCardTrigger asChild> */}
          <SliderPrimitive.Track
            data-slot="slider-track"
            ref={trackRef}
            className={cn(
              "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            )}
            onPointerOver={onPointerOver}
            onPointerLeave={onPointerLeave}

          >
            <SliderPrimitive.Range
              data-slot="slider-range"
              className={cn(
                "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
              )}
            />
          </SliderPrimitive.Track>
        {/* </HoverCardTrigger> */}
        <HoverCardTrigger asChild>
            <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            onPointerDown={() => {
              isDraggingRef.current = true
              setHoverIndex(undefined)
            }}
            onPointerUp={() => {
              isDraggingRef.current = false
            }}
            onPointerCancel={() => {
              isDraggingRef.current = false
            }}
            />
        </HoverCardTrigger>
        {sliderIndex !== undefined && (
          <HoverCardContent
            unselectable="on"
            hideWhenDetached
            side="top"
            align="center"
            className="pointer-events-none"
          >
            <div ref={hoverXRef} className="will-change-transform">
              {hovercards[sliderIndex]}
            </div>
          </HoverCardContent>
        )}
      
      </HoverCard>
    </SliderPrimitive.Root>
  )
}

  // {undefined !== sliderIndex && 
  //         <HoverCardContent unselectable="on" hideWhenDetached={true}>
  //           <div ref={divARef}>
  //               {/* {hovercardContentRef.current} */}
  //               {hovercards[sliderIndex]}
  //           </div>
  //           {/* <div ref={divBRef} className="absolute inset-0 w-full h-full">
                
  //           </div> */}
  //         </HoverCardContent>
  //       }