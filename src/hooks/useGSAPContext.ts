import type { Defined } from '@/lib/type-utils';
import { useGSAP, type useGSAPConfig } from '@gsap/react';
// import {gsap as GSAP} from 'gsap';
import React from 'react';

type GSAPScope = Defined<Parameters<typeof gsap.context>[1]>; // useGSAPConfig['scope']
// type UseGSAPEffect = (effect: gsap.ContextFunc, deps?: React.DependencyList, scope?: GSAPScope, revertOnUpdate?: useGSAPConfig['revertOnUpdate']) => void;

// const useGSAPEffect: UseGSAPEffect = (effect, deps, scope, revertOnUpdate) => {
//     const effect_ = React.useEffectEvent(effect);
//     React.useEffect(() => {
//         const effectFunc = effect_;
//         const ctx = gsap.context(effectFunc, scope)
//         if(revertOnUpdate)
//             return ()=>{ctx.revert()}
//     }, [deps, scope, revertOnUpdate])
// }


// const useGSAPLayoutEffect: UseGSAPEffect = (effect, deps, scope, revertOnUpdate) => {
//     const effect_ = React.useEffectEvent(effect);
//     React.useLayoutEffect(() => {
//         const effectFunc = effect_;
//         const ctx = gsap.context(effectFunc, scope)
//         if(revertOnUpdate)
//             return ()=>{ctx.revert()}
//     }, [deps, scope, revertOnUpdate])
// }


function useGSAPContext(func?: gsap.ContextFunc, options?: useGSAPConfig): React.RefObject<gsap.Context | null> {
    const contextRef = React.useRef<gsap.Context | null>(null);

    useGSAP((ctx, ctxSafe) => {
        contextRef.current = ctx;
        const cleanup = func?.(ctx, ctxSafe) as undefined | (()=>(void | (()=>void)));
        return () => {
            try {
                cleanup?.()
            } finally {
                contextRef.current = null;
            }
        }
    }, options)

    return contextRef;
}


export {useGSAPContext};