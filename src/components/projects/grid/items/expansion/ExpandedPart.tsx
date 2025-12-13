import * as React from 'react';
import { gsap } from "gsap";


type ExpandedPartProps = React.ComponentProps<"div"> & {
    id: string,
    expanded: boolean,
    ref?: React.RefObject<HTMLDivElement | null>,
    setSizeChanging: (changing: boolean) => void,
}

const ExpandedPart = React.memo(({setSizeChanging, children, id, ref: externalRef, expanded, ...props}: ExpandedPartProps) => {
    // const lightboxIsOpen = useEffectEvent(()=>lightboxOpen);
    const localRef = React.useRef<HTMLDivElement | null>(null);
    const ref = React.useMemo(()=>(externalRef ?? localRef), [externalRef]);

    const [canUnmount, setCanUnmount] = React.useState<boolean>(!expanded);

    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleExpandedChange = React.useEffectEvent((el: HTMLDivElement, expanded: boolean) => {
        // console.log(`PROJECT ITEM '${id}' EXPANDED:`, expanded);
        if (expanded) {
            // Expand: animate from 0 to scrollHeight
            gsap.killTweensOf(el);
            clearTimeout(timeoutRef.current);
            setCanUnmount(false);
            gsap.set(el, {visibility: 'visible'});
            gsap.fromTo(
                el,
                { height: el.clientHeight, opacity: el.style.opacity },
                {
                    height: el.scrollHeight,
                    opacity: 1,
                    duration: 0.3,
                    ease: "power1.out",
                    onStart: () => {
                        setSizeChanging(true)
                    },
                    onComplete: () => { 
                        gsap.set(el, { height: "auto" });
                        setSizeChanging(false)
                    },
                    onInterrupt: ()=>{
                        setSizeChanging(false);
                    },
                }
            );
        } else if (el.clientHeight === 0) {
            // setCanUnmount(true);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(()=>setCanUnmount(true), 5000);
        } else {
            // Collapse: animate from current height to 0
            gsap.killTweensOf(el);
            gsap.fromTo(
                el,
                { height: el.clientHeight, opacity: el.style.opacity },
                { height: 0, opacity: 0, duration: 0.3, ease: "power1.in",
                    onStart: ()=>{setSizeChanging(true)},
                    onComplete() {
                        gsap.set(el, {visibility: 'hidden'});
                        requestAnimationFrame(()=>{
                            clearTimeout(timeoutRef.current);
                            timeoutRef.current = setTimeout(()=>setCanUnmount(true), 5000);
                        });
                        setSizeChanging(false);
                    },
                    onInterrupt: ()=>{
                        setSizeChanging(false);
                    }
                 },
            );
        }
    });

    // Handle expand/collapse animation
    React.useEffect(() => {
        console.log('Beginning handleExpandedChange')
        const el = ref.current;
        if (!el) return;
        // React.startTransition(()=>handleExpandedChange(el, expanded));
        handleExpandedChange(el, expanded);
        console.log('Ending handleExpandedChange');
    }, [expanded, ref]);

    // const lastRef = React.useRef<HTMLDivElement | null>(ref.current);
    // React.useEffect(()=>{
    //     const current = ref.current;
    //     if(current === lastRef.current) return;
    //     lastRef.current = current;
    //     if(!current) return;
    //     const handler = (evt: Event) => { evt.stopPropagation(); };

    //     current.addEventListener('scroll', handler);
    //     return ()=>{current.removeEventListener('scroll', handler)};
    // }, [ref]);

    if(canUnmount && !expanded) return null;
    // return <React.Suspense fallback={<div className='w-full min-h-20 h-min bg-blue-500'>Placeholder</div>}>
    return <div ref={ref} 
        style={{ height: 0, overflow: 'clip', opacity: 0, width: '100%', visibility: 'hidden'}} 
        data-slot='project-item-extra' {...props}>{children}</div>
    // </React.Suspense>
});

export default ExpandedPart;
