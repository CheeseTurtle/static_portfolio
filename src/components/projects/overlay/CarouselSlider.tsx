import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";


export type CarouselSliderProps = {
    // hovercardContents: React.ReactNode[],
    getHovercardContentForIndex: (index: number)=>React.ReactNode,
    numSlides: number,
} & React.ComponentProps<typeof SliderPrimitive.Root>;

export default function CarouselSlider({
    className,
    defaultValue,
    value,
    getHovercardContentForIndex,
    numSlides,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    onValueChange,
    ...props
}: CarouselSliderProps) {


//   const _values = React.useMemo(
//     () =>
//       Array.isArray(value)
//         ? value
//         : Array.isArray(defaultValue)
//           ? defaultValue
//           : [min, max],
//     [value, defaultValue, min, max]
//   )

    // const numSlides = React.useMemo(()=>hovercardContents.length, [hovercardContents]);

    const getHovercardContent = React.useCallback((index: number | undefined)=>{
        if(index === undefined) return null;
        return getHovercardContentForIndex(index) ?? null;
        // return hovercardContents[index] ?? null;
    }, [getHovercardContentForIndex]);
    const getHovercardContent_ = React.useEffectEvent(getHovercardContent);


    const divARef = React.useRef<HTMLDivElement>(null);
    // const divBRef = React.useRef<HTMLDivElement>(null);

    const [sliderIndex, setSliderIndex] = React.useState<number | undefined>(value?.[0] ?? undefined);
    
    
    const onValueChange_ = React.useCallback((value: number[])=>{
        setSliderIndex(value[0]);
        onValueChange?.(value);
    }, [onValueChange]);
    
    
    const hovercardContentRef = React.useRef<React.ReactNode>(null);
    
    React.useEffect(()=>{
        const newContent = getHovercardContent_(sliderIndex);
        if(newContent === hovercardContentRef.current) return;
        hovercardContentRef.current = newContent;
    }, [sliderIndex]);

    if(!numSlides) return null;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={1}
      max={numSlides}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      onValueChange={onValueChange_}
    //   onValueCommit={}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      
        <HoverCard>
            <HoverCardTrigger asChild>
                <SliderPrimitive.Thumb
                data-slot="slider-thumb"
                className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                />
            </HoverCardTrigger>
            <HoverCardContent unselectable="on" hideWhenDetached={true}>
                <div ref={divARef}>
                    {hovercardContentRef.current}
                </div>
                {/* <div ref={divBRef} className="absolute inset-0 w-full h-full">
                    
                </div> */}
            </HoverCardContent>
        </HoverCard>

    </SliderPrimitive.Root>
  )
}
