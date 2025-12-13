import { useIntersectionObserverCallback } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import React from "react";
// import type {JSX} from 'react';


export default function StickyDiv({className, children, ...props}: React.ComponentProps<'div'>) {
    const [stuck, setStuck] = React.useState<boolean | undefined>(undefined);
    const ref = React.useRef<HTMLDivElement|null>(null);

    const intersectionCallback = React.useCallback((entry: IntersectionObserverEntry, _observer: IntersectionObserver) => {
        // console.log('INTERSECTION CALLBACK', entry.isIntersecting, entry.intersectionRatio, entry)
        setStuck(!entry.isIntersecting);
    }, []);
    useIntersectionObserverCallback(ref, intersectionCallback, {threshold: 1});

    const stickyState = React.useMemo(()=>(stuck ? 'stuck' : (undefined === stuck ? undefined : 'unstuck')), [stuck]);
    return <>
        <div className={cn(
            'sticky',
            className
        )} data-sticky-state={stickyState} {...props}>
            <div ref={ref} className='sticky-sentinel absolute block bg-none outline-none border-none shadow-none p-0 m-0 inset-0'/>
            {children}
        </div>
    </>
}