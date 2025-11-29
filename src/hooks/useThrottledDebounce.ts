// import * as React from "react";

// import { useThrottle } from "./use-throttle";
import { useDebounceCallback } from "./use-debounce-callback";

// type ThrottledDebounceOptions = Omit<Exclude<Parameters<typeof useDebounceCallback>[2], undefined>, 'maxWait'>;

export default function useThrottledDebounce<T extends (...args: any) => ReturnType<T>>(func: T, debounceDelay: number | undefined = 500, throttleIvl: number | undefined = 1000) {
    return useDebounceCallback(func, debounceDelay, {maxWait: throttleIvl, leading: false, trailing: true});
}