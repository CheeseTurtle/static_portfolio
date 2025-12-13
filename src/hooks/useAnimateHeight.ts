// import type {gsap as GSAP} from 'gsap';
import React from 'react';
export default function useAnimateMount<T extends Element>(animateIn?: (el: T, changed: boolean) => void, animateOut?: (el: T | null, changed: boolean) => void) {
    const ref = React.useRef<T|null>(null);

    const refCallback = React.useCallback((el: T | null)=>{
        try{
            if(el)
                animateIn?.(el, el !== ref.current);
            else
                animateOut?.(ref.current, !!ref.current);
        } finally {
            ref.current = el;
        }
    }, [animateIn, animateOut]);

    return [refCallback, ref]
}