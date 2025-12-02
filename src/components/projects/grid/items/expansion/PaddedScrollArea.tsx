import React from "react";
// import { Slot } from "@radix-ui/react-slot";
// import { /*ScrollArea,*/ ScrollBar } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils"
// import { ScrollArea, ScrollAreaProps, ScrollAreaScrollbar, ScrollAreaScrollbarProps, ScrollAreaCorner, ScrollAreaCornerProps, ScrollAreaThumb, ScrollAreaThumbProps, ScrollAreaViewport, ScrollAreaViewportProps } from "@radix-ui/react-scroll-area";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import type { /*ScrollAreaProps,*/ ScrollAreaCornerProps, ScrollAreaScrollbarProps, ScrollAreaThumbProps, ScrollAreaViewportProps } from "@radix-ui/react-scroll-area";


type PaddedScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
    viewportProps?: ScrollAreaViewportProps,
    scrollbarProps?: Omit<ScrollAreaScrollbarProps, 'orientation'>,
    horizontalScrollbarProps?: Omit<ScrollAreaScrollbarProps, 'orientation'>,
    verticalScrollbarProps?: Omit<ScrollAreaScrollbarProps, 'orientation'>,
    thumbProps?: ScrollAreaThumbProps,
    verticalThumbProps?: ScrollAreaThumbProps,
    horizontalThumbProps?: ScrollAreaThumbProps,
    cornerProps?: ScrollAreaCornerProps
};


// type CombinePropsReturnInner<A extends object, B extends object> = A & B extends never ? (
//     {[P in (keyof A) | (keyof B)]: (
//         P extends keyof A ? (
//             (P extends keyof B ? 
//                 A[P] | B[P]
//             : A[P])
//         ) : P extends keyof B ? (
//             B[P]
//         ) : never
//     )}
// ) : (A & B);

// type CombinePropsReturn<A extends undefined | object, B extends undefined | object> = (
//     Exclude<A, undefined> extends (infer AA extends object) ? (
//         Exclude<B, undefined> extends (infer BB extends object) ? (
//             // CombinePropsReturnInner<AA,BB>  // AA & BB
//             AA & BB
//         ) : A
//     ) : (
//         Exclude<B, undefined> extends (infer BB extends object) ? BB : undefined
//     )
// );

type CombinePropsReturn<A extends object | undefined, B extends object | undefined> = (
    undefined extends A ? (
        undefined extends B ? undefined : B
    ) : (
        undefined extends B ? A : (
            A & B
        )
    )
);

type _A = {x: number, y: bigint, a: number};
type _B = {a: string, b: symbol};

type x = CombinePropsReturn<_A | undefined, _B | undefined>;


function combineProps(a: undefined, b: undefined): undefined;
function combineProps<A extends undefined | object, B extends undefined | object>(a: A, b: B): (A & B);
function combineProps<A extends undefined | object, B extends undefined | object>(a: A, b: B): (A & B) | undefined {
    if(a === undefined && b === undefined) {
        return undefined;
    } else {
        return {...a, ...b};
    }
}

function PaddedScrollArea({
  className,
  children,
  viewportProps,
  scrollbarProps,
  horizontalScrollbarProps,
  verticalScrollbarProps,
  thumbProps,
  horizontalThumbProps,
  verticalThumbProps,
  cornerProps,
  ...props
}: PaddedScrollAreaProps) {
    // const hbarProps = combineProps(scrollbarProps, horizontalScrollbarProps);
    // const 
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn(
        "relative",
        // "p-[-5] m-5",
        // "bg-blue-800",
        // "outline-2", "outline-red-500",
        className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        {...viewportProps}
        className={cn(
            "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
            // "outline-2", "outline-green-400",
            // "box-border",
            viewportProps?.className
        )}
      >
        {children}
        <ScrollBar orientation="horizontal" {...scrollbarProps} {...horizontalScrollbarProps} thumbProps={{...thumbProps, ...horizontalThumbProps}}/>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar {...scrollbarProps} {...verticalScrollbarProps} thumbProps={{...thumbProps, ...verticalThumbProps}} />
      <ScrollAreaPrimitive.Corner {...cornerProps} />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  thumbProps,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & { thumbProps?: ScrollAreaThumbProps }) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        {...thumbProps}
        className={cn("bg-border relative flex-1 rounded-full", thumbProps?.className)}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { PaddedScrollArea }




// type PaddedScrollAreaProps = React.ComponentProps<typeof ScrollArea> & {
//     // extraPad: string | number | [string | number, string | number] | [string | number, string | number, string | number, string | number],
//     extraPad?: string | number | {left?: string | number, right?: string | number, top?: string | number, bottom?: string | number, x?: string | number, y?: string | number},
//     wrapperRef?: React.RefObject<HTMLDivElement | null>
// };

// // function getPadSpec(extraPad: string | number | [string | number, string | number] | [string | number, string | number, string | number, string | number]) {
// //     if(Array.isArray(extraPad)) {
// //         const n = extraPad.length;
// //         if(length >= 4) {
            
// //         } else if(length === 1) {
// //             extraPad = extraPad[0];
// //             if(!(typeof extraPad === 'string' || typeof extraPad === 'number')) 
// //                 throw new TypeError();
// //         } else if(length <= 0) {
// //             return {};
// //         } else {
// //             return {
// //                 top: extraPad[0],
// //                 right: extraPad[1],
// //                 bottom: extraPad[0],
// //                 left: extraPad[1],
// //             }
// //         }
// //     }
// // }

// // function negateValue(v: number): number;
// // function negateValue(v: string): string;
// // function negateValue(v: undefined): undefined;
// function negateValue<T extends number | string | undefined>(v: T): (T extends number ? number : never) | (T extends string ? string : never) | (T extends undefined ? undefined : never);
// function negateValue(v: number | string | undefined): typeof v {
//     if(v===undefined) return undefined;
//     if(typeof v === 'string')
//         return v;
//     return -v;
// }

// function negateValues<T extends {top?: number | string | undefined, bottom?: number | string | undefined, left?: number | string | undefined, right?: number | string | undefined}>(spec: T): {[P in (keyof T)]: T[P]} {
//     const ret: Partial<{[P in (keyof T)]: T[P]}> = {};

//     // TODO: Parse numbers

//     if(spec.top !== undefined) ret.top = negateValue(spec.top);
//     if(spec.right !== undefined) ret.right = negateValue(spec.right);
//     if(spec.bottom !== undefined) ret.bottom = negateValue(spec.bottom);
//     if(spec.left !== undefined) ret.left = negateValue(spec.left);
//     return ret as {[P in (keyof T)]: T[P]};
// }

// export default function PaddedScrollArea({extraPad, children, wrapperRef, asChild, ...props}: PaddedScrollAreaProps) {
    
//     const padSpec = (()=>(
//         typeof extraPad === 'object' ? (
//             {
//                 top: extraPad.top ?? extraPad.y,
//                 right: extraPad.right ?? extraPad.x,
//                 bottom: extraPad.bottom ?? extraPad.y,
//                 left: extraPad.left ?? extraPad.x,
//             }
//         ) : (extraPad === undefined ? {} : {
//             left: extraPad, right: extraPad, top: extraPad, bottom: extraPad
//         }
//     )))();
//     // [extraPad]);
//     const negSpec = negateValues(padSpec);

//     // const Comp = asChild ? Slot : 'div';
//     return <ScrollArea asChild={asChild} {...props} style={{
//         paddingLeft: padSpec.left,
//         paddingRight: padSpec.right,
//         paddingBottom: padSpec.bottom,
//         paddingTop: padSpec.top
//     }}>
//         <div ref={wrapperRef} style={{
//             paddingLeft: negSpec.left,
//             paddingRight: negSpec.right,
//             paddingBottom: negSpec.bottom,
//             paddingTop: negSpec.top
//         }}>
//             {children}
//         </div>
//     </ScrollArea>;
// }
