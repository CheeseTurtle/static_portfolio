import { SliderTooltip, type SliderTooltipProps, SliderTooltipContent, type SliderTooltipContentProps } from "./SliderTooltip";
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

const YearSliderThumb = React.forwardRef(({ children, index, value, thumbRef, tooltipRef }: React.PropsWithChildren<YearSliderThumbProps>, ref) => {

  // const localTooltipRef = React.useRef<React.JSX.Element & React.ReactElement<SliderTooltipProps, typeof SliderTooltip>>(null);
  // const tooltipRef_ = React.useMemo(()=>tooltipRef ?? localTooltipRef, [tooltipRef, localTooltipRef]);

  // const localThumbRef = React.useRef<HTMLSpanElement>(null);
  // const thumbRef_ = thumbRef ?? localThumbRef;

  const [tooltipOpen, setTooltipOpen] = React.useState<boolean>(false);

  // const onFocusChange = React.useCallback((evt: FocusEvent, capture?: boolean)=>{
  //   // const tooltip = tooltipRef_.current;
  //   // if(!tooltip) return;
  //   console.log(`Focus change (index: ${index}, capture: ${capture ?? false})`, evt, tooltip, thumbRef_.current);
  // }, [index, thumbRef_, setTooltipOpen]);

  // const onFocusChangeCapture = React.useCallback((evt: FocusEvent) => onFocusChange(evt, true), [onFocusChange]);


  // React.useEffect(()=>{
  //   const thumb = thumbRef_.current;
  //   if(!thumb) return;
  //   const opts: AddEventListenerOptions = {
  //     passive: true,
  //   }

  //   thumb.addEventListener('focus', onFocusChange, opts);
  //   for(const evtType of ['focus', 'focusin', 'focusout']) {
  //   }
  // }, [onFocusChange, onFocusChangeCapture, thumbRef_.current]);


  // console.log(onFocusChange);

  return <SliderTooltip ref={tooltipRef} defaultOpen={false}
    open={tooltipOpen}
    onOpenChange={setTooltipOpen}
    content={children} /*content={<p>{value?.[index]}</p>}*/ triggerProps={{ asChild: true }} contentProps={{ asChild: false }}>
    <SliderPrimitive.Thumb
      ref={thumbRef}
      data-slot="slider-thumb"
      key={index}
      onFocus={evt => {
        setTooltipOpen(true);
      }}
      onBlur={evt => {
        setTooltipOpen(false);
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

  return (
    <div className="min-w-1.5 w-full grow space-y-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5">
      {/* Min/Max Labels Row */}
      <div className="flex justify-between text-sm text-muted-foreground px-0.5 w-[60%]">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {/* Slider row */}
      <SliderPrimitive.Root
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
          <YearSliderThumb key={index} value={value} index={index}>{value?.[index]}</YearSliderThumb>
        ))}
      </SliderPrimitive.Root>
    </div>
  )
}


type YearSliderProps = React.CustomComponentPropsWithRef<typeof YearSlider>;

export { YearSlider, type YearSliderProps };
export default YearSlider;