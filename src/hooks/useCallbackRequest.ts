import React, { useRef } from "react";

export function useAnimationFrameRequest(initialHandle?: number) {
    const handle = useRef<number | undefined>(initialHandle)

    const requestAnimFrame = React.useCallback((callback: Parameters<typeof requestAnimationFrame>[0], replace?: boolean)=>{
        if(handle.current !== undefined){
            if(replace)
                cancelAnimationFrame(handle.current);
            else
                return false
        }
        handle.current = requestAnimationFrame((time)=>{
            handle.current = undefined
            callback(time);   
        })
        return true
    }, []);

    const cancelAnimFrame = React.useCallback(()=>{
        if(handle.current == undefined)
            return false
        try {
            cancelAnimationFrame(handle.current)
        } finally {
            handle.current = undefined
        }
        return true
    }, [])

    return [requestAnimFrame, cancelAnimFrame]
}



export type UseIdleCallbackRequestOptions = Parameters<typeof requestIdleCallback>[1] & {
    replace?: boolean
}

export function useIdleCallbackRequest(initialHandle?: number) {
    const handle = useRef<number | undefined>(initialHandle);

    const requestCallback = React.useCallback((callback: Parameters<typeof requestIdleCallback>[0], opts?: UseIdleCallbackRequestOptions)=>{
        if(handle.current !== undefined) {
            if(opts?.replace)
                cancelIdleCallback(handle.current);
            else
                return false;
        }
        handle.current = requestIdleCallback((deadline)=>{
            handle.current = undefined
            callback(deadline);   
        }, opts)
        return true
    }, []);

    const cancelCallback = React.useCallback(()=>{
        if(handle.current == undefined)
            return false
        try {
            cancelIdleCallback(handle.current)
        } finally {
            handle.current = undefined
        }
        return true
    }, [])

    return [requestCallback, cancelCallback]
}