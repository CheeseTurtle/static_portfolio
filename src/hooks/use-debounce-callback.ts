import * as React from "react"
import debounce from "lodash.debounce"

import { useUnmount } from "./use-unmount"

interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
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


export function useDebounceCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  delay = 500,
  options?: DebounceOptions
): DebouncedState<T> {
  const debouncedFunc = React.useRef<ReturnType<typeof debounce>>(null);
  const isPending = React.useRef<boolean>(false);

  useUnmount(() => {
    debouncedFunc.current?.cancel();
  });

  const func_: T = React.useCallback(((...args) => {
    isPending.current = false;
    return func(...args);
  }) as T, [func]);

  const debounced = React.useMemo(() => {
    if (debouncedFunc.current) {
      debouncedFunc.current.cancel();
      isPending.current = false;
    }

    const debouncedFuncInstance = debounce(func_, delay, options);
    debouncedFunc.current = debouncedFuncInstance

    const wrappedFunc: DebouncedState<T> = (...args: Parameters<T>) => {
      isPending.current = true;
      return debouncedFuncInstance(...args)
    }

    wrappedFunc.cancel = () => {
      debouncedFuncInstance.cancel();
      isPending.current = false;
    };
      
    wrappedFunc.flush = () => {
      const result = debouncedFuncInstance.flush();
      isPending.current = false;
      return result;
    }

    wrappedFunc.isPending = () => isPending.current;  // Still not ideal, but better
    
    return wrappedFunc;
  }, [func_, delay, options]);

  return debounced;
}

// export function useDebounceCallback<T extends (...args: any) => ReturnType<T>>(
//   func: T,
//   delay = 500,
//   options?: DebounceOptions
// ): DebouncedState<T> {
//   const debouncedFunc = React.useRef<ReturnType<typeof debounce>>(null)

//   useUnmount(() => {
//     if (debouncedFunc.current) {
//       debouncedFunc.current.cancel()
//     }
//   })

//   const debounced = React.useMemo(() => {
//     const debouncedFuncInstance = debounce(func, delay, options)

//     const wrappedFunc: DebouncedState<T> = (...args: Parameters<T>) => {
//       return debouncedFuncInstance(...args)
//     }

//     wrappedFunc.cancel = () => {
//       debouncedFuncInstance.cancel()
//     }

//     wrappedFunc.isPending = () => {
//       return !!debouncedFunc.current
//     }

//     wrappedFunc.flush = () => {
//       return debouncedFuncInstance.flush()
//     }

//     return wrappedFunc
//   }, [func, delay, options])

//   React.useEffect(() => {
//     debouncedFunc.current = debounce(func, delay, options)
//   }, [func, delay, options])

//   return debounced
// }
