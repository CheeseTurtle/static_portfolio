import { /*Tooltip, TooltipContent,*/ TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { /*TooltipArrow,*/ type TooltipArrowProps, /*TooltipPortal,*/ type TooltipContentProps, type TooltipPortalProps, type TooltipTriggerProps, type TooltipProviderProps, type TooltipProps } from "@radix-ui/react-tooltip";
import React, { forwardRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
// import type { PropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import type { OneChildOrNoChildren, PropsWithOptionalPropType } from "@/lib/type-utils";

// <Tooltip.Provider>
// 	<Tooltip.Root>
// 		<Tooltip.Trigger />
// 		<Tooltip.Portal>
// 			<Tooltip.Content>
// 				<Tooltip.Arrow />
// 			</Tooltip.Content>
// 		</Tooltip.Portal>
// 	</Tooltip.Root>
// </Tooltip.Provider>



// type TooltipRootProps =  React.ComponentProps<typeof TooltipPrimitive.Root>;

// export type  SliderTooltipProviderProps = TooltipProviderProps & {

// };

// export const SliderTooltipProvider = ({children, ...props}: SliderTooltipProviderProps)  => {
//     return <TooltipProvider {...props}>{children}</TooltipProvider>
// };

// export type SliderTooltipRootProps = React.ComponentProps<typeof TooltipPrimitive.Root> & {
    
// };

// export const SliderTooltipRoot = ({children, ...props}: SliderTooltipRootProps) => {
//     return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
// };




// export type  SliderTooltipTriggerProps = TooltipTriggerProps & {


// };

// export const SliderTooltipTrigger = (props: SliderTooltipTriggerProps) => {



// };

// export type SliderTooltipPortalProps = TooltipPortalProps & {

// };

// export const SliderTooltipPortal = (props: SliderTooltipPortalProps) => {


// };

export type SliderTooltipContentProps = TooltipContentProps & {
    portalProps?: TooltipPortalProps,

    arrowClassName?: string | undefined,
    arrowProps?: TooltipArrowProps,
};

export const SliderTooltipContent = ( {
    className,
    sideOffset = 0,
    children,
    portalProps,
    arrowClassName,
    arrowProps,
    ...props}: SliderTooltipContentProps) => {
    return (
    <TooltipPrimitive.Portal {...portalProps}>
        <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
            "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
            className
        )}
        {...props}
        >
        {children}
        <TooltipPrimitive.Arrow className={cn("bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]", arrowClassName)} {...arrowProps} />
        </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
    )
}



// export type SliderTooltipArrowProps = TooltipArrowProps & {

// };

// export const SliderTooltipArrow = (props: SliderTooltipArrowProps) => {


// };

export type SliderTooltipProps = PropsWithOptionalPropType<TooltipProps, "children", any, OneChildOrNoChildren> & {
    content: string | React.ReactNode,

    sideOffset?: number,
    forceMount?: true | undefined,
    portalContainer?: Element | DocumentFragment | null | undefined,

    triggerProps?: TooltipTriggerProps,
    contentProps?: TooltipContentProps,

    contentClassName?: string | undefined,

    arrowProps?: TooltipArrowProps,
    arrowClassName?: string | undefined,
    
    providerProps?: TooltipProviderProps,
};


export const SliderTooltip = forwardRef(({children, portalContainer, forceMount, contentClassName, triggerProps, contentProps, arrowProps, providerProps, sideOffset = 0, arrowClassName, ...props}: SliderTooltipProps, _ref) => {
    const content = React.useMemo(()=>(
        typeof props.content === 'object' ? props.content : <p>{props.content}</p>
    ), [props.content]);

    return <TooltipProvider>
        <TooltipPrimitive.Root data-slot="tooltip" {...props}>
            {children && <TooltipTrigger {...triggerProps}>{children}</TooltipTrigger>}
            <SliderTooltipContent className={contentClassName} {...contentProps} portalProps={{forceMount, container: portalContainer}} arrowProps={arrowProps} arrowClassName={arrowClassName} sideOffset={sideOffset}>{content}</SliderTooltipContent>
        </TooltipPrimitive.Root>
    </TooltipProvider>


    // return <Tooltip {...props}>
    //     <TooltipTrigger {...triggerProps}>{children}</TooltipTrigger>
    //     <TooltipPortal container={portalContainer} forceMount={forceMount}>
    //         <TooltipContent {...contentProps}>
    //             {content}
    //         </TooltipContent>
    //     </TooltipPortal>
    // </Tooltip>
});