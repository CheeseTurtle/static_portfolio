import { SliderTooltip, type SliderTooltipProps } from "./SliderTooltip";
// import { Slider } from "@/components/ui/slider";



import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"


type YearSliderThumbProps = {
  index: number,
  value?: number[] | undefined,
  // thumbRef?: React.RefObject<React.JSX.Element & React.ReactElement<SliderPrimitive.SliderThumbProps, typeof SliderPrimitive.Thumb>>,
  thumbRef?: React.RefObject<HTMLSpanElement>,
  tooltipRef?: React.RefObject<React.JSX.Element & React.ReactElement<SliderTooltipProps, typeof SliderTooltip>>
};

const YearSliderThumb = React.forwardRef(({ children, index, value: _value, thumbRef, tooltipRef }: React.PropsWithChildren<YearSliderThumbProps>, _ref) => {

  // const localTooltipRef = React.useRef<React.JSX.Element & React.ReactElement<SliderTooltipProps, typeof SliderTooltip>>(null);
  // const tooltipRef_ = React.useMemo(()=>tooltipRef ?? localTooltipRef, [tooltipRef, localTooltipRef]);

  const localThumbRef = React.useRef<HTMLSpanElement>(null);
  const thumbRef_ = thumbRef ?? localThumbRef;

  const [tooltipOpen, setTooltipOpen] = React.useState<boolean | undefined>(undefined); // thumbRef_.current?.isSameNode(document.activeElement));

  const [hasFocus, setHasFocus] = React.useState<boolean | undefined>(undefined);
  const [hasMouseFocus, setHasMouseFocus] = React.useState<boolean | undefined>(undefined);
  // const [hasNonMouseFocus, setHasNonMouseFocus] = React.useState<boolean | undefined>(undefined);

  const onOpenChange = React.useCallback((open: boolean) => {
    if(open || !(hasFocus || hasMouseFocus)) setTooltipOpen(open);
  }, [hasFocus, hasMouseFocus]);

  return <SliderTooltip ref={tooltipRef} // defaultOpen={false}
    open={tooltipOpen}
    onOpenChange={onOpenChange}
    content={children} /*content={<p>{value?.[index]}</p>}*/ triggerProps={{ asChild: true }} contentProps={{ asChild: false }}>
    <SliderPrimitive.Thumb
      ref={thumbRef_}
      data-slot="slider-thumb"
      key={index}
      onMouseEnter={(_evt)=>{
        setHasMouseFocus(true);
      }}
      onMouseLeave={(_evt)=>{
        setHasMouseFocus(false);
        setHasFocus(false);
      }}
      onFocus={_evt => {
        // console.log('Focused', evt);
        setHasFocus(true);
        setTooltipOpen(true);
        // evt.stopPropagation();
      }}
      onBlur={evt => {
        // console.log('Blurred', evt);
        setTooltipOpen(false);
        setHasFocus(false);
        evt.stopPropagation();
      }}
      // onFocusCapture={(evt)=>onFocusChange(evt, true)}
      // onFocus={onFocusChange}
      // onBlurCapture={(evt)=>onFocusChange(evt, true)}
      // onBlur={onFocusChange}
      className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderTooltip>
});


function YearSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  //   showTooltips,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  const descId = "year-slider-desc";

  return (
    <div className="min-w-1.5 w-full flex flex-col grow space-y-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5 ">
      {/* Min/Max Labels Row */}
      <div id={descId} className="flex justify-between text-sm text-muted-foreground px-0.5 w-[60%] pointer-events-none select-none">
        <span className="pointer-events-none select-none" aria-hidden="true">{min}</span>
        <span className="pointer-events-none select-none" aria-hidden="true">{max}</span>
      </div>
 
      {/* Slider row */}
      <SliderPrimitive.Root
        role="group"
        aria-label="Year range"
        aria-describedby={descId}
         data-slot="slider"
         defaultValue={defaultValue}
         value={value}
         min={min}
         max={max}
         className={cn(
           "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
           "grid-row-2",
           className
         )}
         {...props}
       >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-muted relative grow overflow-hidden w-full rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <YearSliderThumb key={index} value={value} index={index} aria-label={`Year ${index === 0 ? 'minimum' : 'maximum'}`}>{value?.[index]}</YearSliderThumb>
        ))}
       </SliderPrimitive.Root>
     </div>
   )
 }
 
type YearSliderProps = React.CustomComponentPropsWithRef<typeof YearSlider>;

export { YearSlider, type YearSliderProps };
export default YearSlider;