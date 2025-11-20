import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipArrow, type TooltipArrowProps, TooltipPortal, type TooltipContentProps, type TooltipPortalProps, type TooltipTriggerProps, type TooltipProviderProps, type TooltipProps } from "@radix-ui/react-tooltip";
import React, { forwardRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import type { PropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

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

type PropsWithoutChildren<Props> = Props extends any ? (Props extends {children?: React.ReactNode | undefined} ? Omit<Props, "children"> : Props) : Props;
// Props extends any ? ("ref" extends keyof Props ? Omit<Props, "ref"> : Props) : Props;



type IsAny<T> = [T] extends [any] ? (any extends T ? true : false) : false;
type IsUnknown<T> = unknown extends T ? true : false;

type PropsWithout<Props, K extends string, V = any> = Props extends any ? (
    IsAny<V> extends true ?
        ((K extends keyof Props ? Omit<Props, K> : Props))
        : (Props extends {[P in K]: infer VT} ? (VT extends V ? Omit<Props, K> : Props) : Props)
) : Props;


type _WithProperty<Props, K extends PropertyKey, V = unknown, Optional extends boolean = false> = (Optional extends true ? WithOptionalProperty<Props,K,V> : WithProperty<Props,K,V>);
type WithProperty<Props, K extends PropertyKey, V = unknown> = Props & {[P in K]: V};
type WithOptionalProperty<Props, K extends PropertyKey, V = unknown> = Props & {[P in K]?: V};


type Or<A,B> = A extends true ? true : (B extends true ? true : false);

type _PropsWithPropType<Props, K extends string, V1, V0 = unknown, Optional extends boolean = false> = Props extends any ? (
    Or<IsAny<V0>, IsUnknown<V0>> extends true ?
        ((K extends keyof Props ? Omit<Props, K> : Props)) & {[P in K]: V1}
        : (Props extends {[P in K]: infer VT} ? (VT extends V0 ? _WithProperty<Omit<Props, K>, K, V1, Optional> : Props) : Props & {[P in K]: V1})
) : Props;

type PropsWithPropType<Props, K extends string, V1, V0 = unknown> = _PropsWithPropType<Props,K,V1,V0,false>;
type PropsWithOptionalPropType<Props, K extends string, V1, V0 = unknown> = _PropsWithPropType<Props,K,V1,V0,true>;
type OneChildOrNoChildren = Exclude<React.ReactNode, Iterable<React.ReactNode>>;

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


export const SliderTooltip = forwardRef(({children, portalContainer, forceMount, contentClassName, triggerProps, contentProps, arrowProps, providerProps, sideOffset = 0, arrowClassName, ...props}: SliderTooltipProps, ref) => {
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