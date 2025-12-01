// import * as React from "react";

// import { useThrottle } from "./use-throttle";
import { useDebounceCallback } from "./use-debounce-callback";

// type ThrottledDebounceOptions = Omit<Exclude<Parameters<typeof useDebounceCallback>[2], undefined>, 'maxWait'>;

// export default function useThrottledDebounce<T extends (...args: any) => ReturnType<T>>(func: T, debounceDelay: number | undefined = 500, throttleIvl: number | undefined = 1000) {
//     return useDebounceCallback(func, debounceDelay, {maxWait: throttleIvl, leading: false, trailing: true});
// }

import * as React from "react"
import debounce from "lodash.debounce"

import { useUnmount } from "./use-unmount"

interface DebounceOptions<T extends any[]> {
    leading?: boolean;
    trailing?: boolean;
    //   maxWait?: number;
    prelim?: (...args: T) => boolean | undefined,
}

interface ControlFunctions {
  cancel: () => void
  flush: () => void
  isPending: () => boolean
}

export type DebouncedState<T extends (...args: any) => ReturnType<T>> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) &
  ControlFunctions


// const DEFAULT_OPTIONS = {leading: false, trailing: true};
export default function useThrottledDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
//   func: T,
//   delay = 500,
  func: T, debounceDelay: number | undefined = 500, throttleIvl: number | undefined = 1000,
  options?: DebounceOptions<Parameters<T>>
): DebouncedState<T> {
    const debouncedFunc = React.useRef<ReturnType<typeof debounce>>(null);
    const isPending = React.useRef<boolean>(false);

    const shouldTriggerPrelim = React.useRef<boolean>(true);

    const prelim = React.useMemo(()=>options?.prelim, [options]);

    const prelimRef = React.useRef<typeof prelim>(prelim);

    
    useUnmount(() => {
        debouncedFunc.current?.cancel();
    });
    
    const options_ = React.useMemo(()=>({
        ...options, maxWait: throttleIvl
    }), [options, throttleIvl]);
    
    React.useEffect(() => {
        prelimRef.current = prelim;
    }, [prelim]);

    const func_: T = React.useCallback(((...args) => {
        isPending.current = false;
        // console.log('Calling func with args:', args);
        try {
            return func(...args);
        } finally {
            shouldTriggerPrelim.current = true;
        }
    }) as T, [func]);

    // const prevFunc = React.useRef<T>(func_);
    // const prevDelay = React.useRef<number>(debounceDelay);
    // const prevOptions = React.useRef<typeof options_>(options_);

    const debounced = React.useMemo(() => {
        // const funcChanged = prevFunc.current !== func_;
        // const delayChanged = prevDelay.current !== debounceDelay;
        // const optsChanged = prevOptions.current !== options_;
        // prevFunc.current = func_;
        // prevDelay.current = debounceDelay;
        // prevOptions.current = options_;
        // console.log('Recreating debouncedFunc (i.e. canceling)', funcChanged, delayChanged, optsChanged);
        if (debouncedFunc.current) {
            debouncedFunc.current.cancel();
            isPending.current = false;
        }
  
      const debouncedFuncInstance = debounce(func_, debounceDelay, options_);
      debouncedFunc.current = debouncedFuncInstance
  
      const wrappedFunc: DebouncedState<T> = (...args: Parameters<T>) => {
        isPending.current = true;
        if(prelimRef.current && shouldTriggerPrelim.current) {
            shouldTriggerPrelim.current = false;
            if(prelimRef.current(...args)) {
                // console.log('PRELIM RETURNED TRUE ==> NOT CALLING')
                isPending.current = false;
                return;
                // return func_(...args);
            }
        }
        // console.log('Calling debouncedFuncInstance with args:', args);
        return debouncedFuncInstance(...args)
      }
  
      wrappedFunc.cancel = () => {
        debouncedFuncInstance.cancel();
        isPending.current = false;
      };
        
      wrappedFunc.flush = () => {
        const wasPending = isPending.current;
        const result = debouncedFuncInstance.flush();
        isPending.current = false;
        if(wasPending) shouldTriggerPrelim.current = true;
        return result;
      }
  
      wrappedFunc.isPending = () => isPending.current;  // Still not ideal, but better
      
      return wrappedFunc;
    }, [func_, debounceDelay, options_]);
  
    return debounced;
}
