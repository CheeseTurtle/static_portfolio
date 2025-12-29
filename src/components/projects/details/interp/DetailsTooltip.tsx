
'use client';



// const HoverDetailsContext = React.createContext(null);

import React from "react";
// import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

// import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

export type DetailsTooltipProps = React.ComponentProps<typeof Tooltip>;

type DetailsTooltipContentProps = React.ComponentProps<typeof TooltipContent>;

// | React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'span'> 
type DetailsTooltipTriggerProps = TooltipPrimitive.TooltipTriggerProps & React.ComponentProps<'span'> & {
    // children: React.ReactElement<React.HTMLAttributes<Text>> | React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> | React.ReactElement<React.ComponentProps<'span'>, 'span'> | string | number | bigint | symbol | boolean
}

function _DetailsTooltip({children, ...props}: DetailsTooltipProps) {
    return <Tooltip {...props}>
        {children}
    </Tooltip>
}

export default function DetailsTooltip({content, children, asChild, key}: {content?: React.ReactNode, children?: React.ReactNode, asChild?: boolean, key?: string}) {
    return <_DetailsTooltip key={key}>
        <DetailsTooltipTrigger asChild={asChild}>{children}</DetailsTooltipTrigger>
        <DetailsTooltipContent>{content}</DetailsTooltipContent>
    </_DetailsTooltip>
}


// background-image: linear-gradient(to right, rgba(100, 100, 100, 0) 0px, rgba(100, 100, 100, 0) 33%, rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0) 100%);
// &:not(:hover)
//     linear-gradient(to right,rgba(var(--border-color-default-rgb),var(--hover-opacity,0)) 0,rgba(var(--border-color-default-rgb),var(--hover-opacity,0)) 33%,transparent 33%,transparent 100%)


// <span class="followup-block outline-none static inline group-hover/message:[--hover-opacity:1]
//     not-hover:bg-linear-to-r not-hover:from-[rgba(var(--border-color-default-rgb),var(--hover-opacity,0))]
//     not-hover:via-[rgba(var(--border-color-default-rgb,var(--hover-opacity,0)))] not-hover:via-33%
//     not-hover:to-transparent not-hover:to-66%
//     bg-position-[0_100%] not-hover:bg-size-[6px_var(--underline-height,8%)]
//     not-hover:bg-repeat-x

//     bg-linear-to-r from-[hsla(51,calc(var(--underline-saturation,1)*100%,50%,calc(var(--hover-opacity,0)*var(--underline-opacity,0))
//     to-[hsla(17,calc(var(--underline-saturation,1)*96%),52%,calc(var(--hover-opacity,0)*var(--underline-opacity,0)))]
//     bg-size-[100%_var(--underline-height,8%)] bg-no-repeat
//     " 
//     tabindex="0" style="--underline-opacity: 0.4; --underline-height: 8%; --underline-saturation: 1;">
//         <span>Tailwind <strong>does not</strong> provide utilities to declare variables</span>
// </span>


// TODO: asChild/Slot for span
export function DetailsTooltipTrigger({className, children, asChild, style, ...props}: DetailsTooltipTriggerProps) {
    // const child = (typeof children === 'object') ? (
    //     children.type === 'text' ? children : children.props.children
    // ) : children;
    return <TooltipTrigger asChild>
        {/* <span {...props} className="relative inline-block cursor-pointer outline-none">
            <span className="relative z-10">{children}</span>
            <span className="absolute left-0 bottom-0 w-full bg-linear-to-r from-[rgba(var(--border-color-rgb),0.4)] bg-repeat-x
                h-[8%]
                bg-size-[6px_100%] group-hover:h-[38%] focus:h-[38%] transition-height duration-200 ease-out 
            "></span>
        </span> */}
        {/* <span className="relative group"> */}
            <span {...props} className={
                cn(`followup-block outline-none static inline-block whitespace-normal`,
                        // not-hover:bg-linear-to-r not-hover:from-[rgba(var(--border-color-default-rgb),var(--hover-opacity,0))]
                        // not-hover:via-[rgba(var(--border-color-default-rgb,var(--hover-opacity,0)))] not-hover:via-33%
                        // not-hover:to-transparent not-hover:to-66%
                        // bg-position-[0_100%] not-hover:bg-size-[6px_var(--underline-height,8%)]
                        // not-hover:bg-repeat-x

                        // bg-linear-to-r from-[hsla(51,calc(var(--underline-saturation,1)*100%,50%,calc(var(--hover-opacity,0)*var(--underline-opacity,0))
                        // to-[hsla(17,calc(var(--underline-saturation,1)*96%),52%,calc(var(--hover-opacity,0)*var(--underline-opacity,0)))]
                        // bg-size-[100%_var(--underline-height,8%)] bg-no-repeat`, 
                    className
                )}>
                <span>{children}</span>
            </span>
        {/* </span> */}
    </TooltipTrigger>
}


export function DetailsTooltipContent(props: DetailsTooltipContentProps) {
    return <TooltipContent {...props}></TooltipContent>
}


export type HoverDetailsProps = DetailsTooltipProps & {
    children?: [React.ReactNode, React.ReactNode],
    contentProps?: DetailsTooltipContentProps,
    triggerProps?: DetailsTooltipTriggerProps,
}
// export function HoverDetails({children, contentProps, triggerProps, ...props}: HoverDetailsProps) {
//     return <_DetailsTooltip {...props}>
//         {children && <>
//             <DetailsTooltipTrigger>{children[0]}</DetailsTooltipTrigger>
//             <DetailsTooltipContent>{children[1]}</DetailsTooltipContent>
//         </>
//     }
//     </_DetailsTooltip>
// }


// export type DetailsHoverCardProps = React.ComponentProps<typeof HoverCardPrimitive.Root> & {

// }

// export function DetailsHoverCard({
//   ...props
// }: DetailsHoverCardProps) {
//   return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
// }



// export type DetailsHoverCardTriggerProps = React.ComponentProps<typeof HoverCardPrimitive.Trigger> & {

// }
// export function DetailsHoverCardTrigger({
//     children,
//     className,
//   ...props
// }: DetailsHoverCardTriggerProps) {
//   return (
//     <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} asChild>
//         <a>{children}</a>
//     </HoverCardPrimitive.Trigger>
//   )
// }


// export type DetailsHoverCardContentProps = React.ComponentProps<typeof HoverCardPrimitive.Content> & {


// }

// export function DetailsHoverCardContent({
//   className,
//   align = "center",
//   sideOffset = 4,
//   ...props
// }: DetailsHoverCardContentProps) {
//   return (
//     <HoverCardPrimitive.Portal data-slot="hover-card-portal">
//       <HoverCardPrimitive.Content
//         data-slot="hover-card-content"
//         align={align}
//         sideOffset={sideOffset}
//         className={cn(
//           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
//           className
//         )}
//         {...props}
//       />
//     </HoverCardPrimitive.Portal>
//   )
// }
