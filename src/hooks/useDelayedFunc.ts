import React from "react";




type Timeout = ReturnType<typeof setTimeout>;


export function useDelayedFunc<P extends any[], R>(f: (...args: P)=>R, delay?: number) {
    const funcRef = React.useRef<typeof f>(f);
    React.useEffect(()=>{funcRef.current = f}, [f]);

    const handle = React.useRef<Timeout | undefined>(undefined);
    const callArgs = React.useRef<P | null>(null);
    const callFunc = React.useCallback((callback: undefined | ((result: R)=>void), ...args: P)=>{
        handle.current = undefined;
        const result = funcRef.current(...args);
        if(callback) callback(result);
    }, []);

    // callback?: (value: R) => void
    const delayedFunc = React.useCallback((...args: P) => {
        clearTimeout(handle.current)
        handle.current = undefined

        callArgs.current = args;

        handle.current = setTimeout(()=>{
            callFunc(undefined, ...args)
        }, delay)
    }, [delay, callFunc])

    const callNow = React.useCallback((failSilently?: boolean)=>{
        if(!callArgs.current) {
            if(failSilently) return;
            throw new Error('No previous call args');
        }
        
    }, [])
}

export default function useDelayedCaller<R>(defaultDelay?: number) {
    const handle = React.useRef<Timeout | undefined>(undefined);
    

    const funcToCall = React.useRef<(() => R) | undefined>(undefined);

    const callFunc = React.useCallback((func: () => R, delay?: number)=>{
        clearTimeout(handle.current);
        handle.current = undefined;

        funcToCall.current = func;
        handle.current = setTimeout(()=>{
            handle.current = undefined;
            func();
        }, delay ?? defaultDelay)

    }, [defaultDelay]);
}