import React, { useCallback, useEffect, useEffectEvent, useMemo, useRef } from "react";

// type ValueChangeWatcherProps<T> = {
//     value: T,
//     equalityFn?: (left: T, right: T) => boolean,
// };

// function ValueChangeWatcher<T>({value, equalityFn}: ValueChangeWatcherProps<T>) {
//     useEffect()
//     return null;
// }

// function useValueChangedEffect<T>(value: T): void;
// function useValueChangedEffect<T>(value: T, equalityFn?: undefined): void;
// // function useValueChangedEffect<T>(value: T, equalityFn?: undefined, useAsDep?: undefined | false): void;
// // function useValueChangedEffect<T>(value: T, equalityFn: (left: T, right: T) => boolean): void;
// function useValueChangedEffect<T>(value: T, equalityFn: (left: T, right: T) => boolean, useAsDep?: boolean): void;
// function useValueChangedEffect<T>(value: T, equalityFn?: (left: T, right: T) => boolean, useAsDep?: boolean): void {

// }

export function useValueChangedEffect<T extends Exclude<any, undefined>>(value: T, callback: (value: T, prev?: T) => void, equalityFn?: (left: T, right: T) => boolean) {
    const prevVal = useRef<T>(value);
    const isFirst = useRef<boolean>(true);
    const equalityFn_ = useEffectEvent((left: T, right: T) => equalityFn ? equalityFn(left, right) : false);
    const callback_ = useEffectEvent((value: T, prev?: T): void => callback(value, prev));
    useEffect(()=>{
        if(isFirst.current) {
            try {
                callback_(value);
            } finally {
                isFirst.current = false;
            }
        } else {
            try {
                if(!equalityFn_(value, prevVal.current))
                    callback_(value, prevVal.current);
            } finally {
                prevVal.current = value;
            }
        }
    }, [value]);
}

export function useValueChangedEffectNoDep<T>(value: T, callback: (value: T, prev?: T) => void, equalityFn?: (left: T, right: T) => boolean) {
    const prevVal = useRef<T>(value);
    const isFirst = useRef<boolean>(true);
    const equalityFn_ = useEffectEvent((left: T, right: T) => equalityFn ? equalityFn(left, right) : left === right);
    const callback_ = useEffectEvent((value: T, prev?: T): void => callback(value, prev));
    useEffect(()=>{
        if(isFirst.current) {
            try {
                callback_(value);
            } finally {
                isFirst.current = false;
            }
        } else {
            try {
                if(!equalityFn_(value, prevVal.current))
                    callback_(value, prevVal.current);
            } finally {
                prevVal.current = value;
            }
        }
    });
}

