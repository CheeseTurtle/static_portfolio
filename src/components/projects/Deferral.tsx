import React from 'react';


export type DeferralProps<T> = {
    value: T,
    initialValue?: T,
    // deferredRef?: React.RefObject<T>,
    children?: React.ReactNode,
    fallback?: React.ReactNode,
    condition?: (value: T, deferred: T) => boolean
}

export default function Deferral<T>({value, initialValue, /*deferredRef,*/ children, fallback, condition}: DeferralProps<T>) {
    const deferredValue = React.useDeferredValue(value, initialValue);
    
    // React.useEffect(()=>{
    //     if(deferredRef) deferredRef.current = deferredValue;
    // }, [deferredValue, deferredRef]);

    const isPending = deferredValue !== value && (!condition || condition(value, deferredValue));
    return isPending ? fallback : children;
}