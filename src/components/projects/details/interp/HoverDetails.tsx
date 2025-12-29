// import { transformAstroChildren } from "@/components/hydration/astroToReact";
import { Dehydrated } from "@/components/hydration/Dehydrated";
import React from "react";


export default function HoverDetails({children, content, ...props}: {content?: React.ReactNode, children?: React.ReactNode, asChild?: boolean, key?: string}) {
    return <Dehydrated importPath='@/components/projects/details/interp/DetailsTooltip' Placeholder="span" content={content} {...props}>
        {/* <React.Fragment key="turtle">{transformAstroChildren(content)}</React.Fragment>
        <React.Fragment key="children">{children}</React.Fragment> */}
        {children}
    </Dehydrated>
}

