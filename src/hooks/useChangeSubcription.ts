import * as React from "react";


type ChangeSubscriptionOptions<T> = {
    equalityFn?: (left: T, right: T) => boolean,
    maxCount?: number,
    initInactive?: boolean,
};

type CallbackFn<T> = (value: T, prev: T, count: number) => void;

export function useChangeSubscription<T>(value: T, callback: CallbackFn<T>, opts?: ChangeSubscriptionOptions<T>) {
    // const callbacks = React.useRef<CallbackFn<T>[]>([]);

    const equalityFn = opts?.equalityFn;
    const maxCount = opts?.maxCount;

    const [isActive, setIsActive] = React.useState<boolean>(opts?.initInactive ?? false);
    const callback_ = React.useEffectEvent(callback);
    const countRef = React.useRef<number>(0);
    const prevRef = React.useRef<T>(value);

    const isActiveRef = React.useRef<boolean>(isActive);

    React.useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    const maybeDoCallback = React.useCallback((value: T, prev: T)=>{
        if(equalityFn && equalityFn(value, prev)) return;
        try {
            countRef.current += 1;
            callback_(value, prev, countRef.current);
        } finally {
            if(maxCount !== undefined && countRef.current >= maxCount)
                setIsActive(false);
        }
    }, [equalityFn, maxCount, setIsActive]);

    const activate = React.useCallback((trigger?: boolean, reset?: boolean)=>{
        if(isActive && !reset) return;
        trigger &&= !isActive;
        
        countRef.current = 0;
        setIsActive(true);
        if(trigger) maybeDoCallback(value, prevRef.current);
    }, [isActive, setIsActive, value, maybeDoCallback]);
    const deactivate = React.useCallback(()=> setIsActive(false),[setIsActive]);

    const maybeDoCallback_ = React.useEffectEvent(maybeDoCallback);

    React.useEffect(()=>{
        try {
            if(isActiveRef.current) maybeDoCallback_(value, prevRef.current);
        } finally {
            prevRef.current = value;
        }
    }, [value]);

    return {get count() { return countRef.current }, isActive, activate, deactivate};
}




export function useChangeSubscriptionWithEqualityFn<T>(value: T, callback: CallbackFn<T>, opts?: ChangeSubscriptionOptions<T>) {
 
    const equalityFn = opts?.equalityFn;
    const maxCount = opts?.maxCount;

    const [isActive, setIsActive] = React.useState<boolean>(opts?.initInactive ?? false);
    const callback_ = React.useEffectEvent(callback);
    const countRef = React.useRef<number>(0);
    const prevRef = React.useRef<T>(value);

    const isActiveRef = React.useRef<boolean>(isActive);

    React.useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    const maybeDoCallback = React.useCallback((value: T, prev: T)=>{
        if(equalityFn && equalityFn(value, prev)) return;
        try {
            countRef.current += 1;
            callback_(value, prev, countRef.current);
        } finally {
            countRef.current += 1;
            if(maxCount !== undefined && countRef.current >= maxCount)
                setIsActive(false);
        }
    }, [equalityFn, maxCount, setIsActive]);

    const activate = React.useCallback((trigger?: boolean, reset?: boolean)=>{
        if(isActive && !reset) return;
        trigger &&= !isActive;
        
        countRef.current = 0;
        setIsActive(true);
        if(trigger) maybeDoCallback(value, prevRef.current);
    }, [isActive, setIsActive, value, maybeDoCallback]);
    const deactivate = React.useCallback(()=> setIsActive(false),[setIsActive]);

    const maybeDoCallback_ = React.useEffectEvent(maybeDoCallback);

    React.useEffect(()=>{
        if(isActiveRef.current) {
            try {
                maybeDoCallback_(value, prevRef.current);
            } finally {
                prevRef.current = value;
            }
        } else {
            prevRef.current = value;
        }
    });

    return {get count() { return countRef.current }, isActive, activate, deactivate};
}