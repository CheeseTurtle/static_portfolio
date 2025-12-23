



// const HoverDetailsContext = React.createContext(null);

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";

export type DetailsTooltipProps = React.ComponentProps<typeof Tooltip>;

type DetailsTooltipContentProps = React.ComponentProps<typeof TooltipContent>;

// | React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'span'> 
type DetailsTooltipTriggerProps = TooltipPrimitive.TooltipTriggerProps & React.ComponentProps<'span'> & {
    // children: React.ReactElement<React.HTMLAttributes<Text>> | React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> | React.ReactElement<React.ComponentProps<'span'>, 'span'> | string | number | bigint | symbol | boolean
}

export function _DetailsTooltip({children, ...props}: DetailsTooltipProps) {
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

export function DetailsTooltipContent(props: DetailsTooltipContentProps) {
    return <TooltipContent {...props}></TooltipContent>
}

// TODO: asChild/Slot for span
export function DetailsTooltipTrigger({className, children, asChild, ...props}: DetailsTooltipTriggerProps) {
    // const child = (typeof children === 'object') ? (
    //     children.type === 'text' ? children : children.props.children
    // ) : children;
    return <TooltipTrigger asChild>
        <span {...props} className={cn(
            "",
            className)}
            >{children}</span>
    </TooltipTrigger>
}