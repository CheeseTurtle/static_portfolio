// useResizeObserver.ts
import { useEffect, useRef, type RefObject } from 'react';

interface UseResizeObserverOptions<T extends HTMLElement> {
  ref: RefObject<T | null>;
  onResize: (entry: ResizeObserverEntry) => void;
  enabled?: boolean;
  throttle?: number; // milliseconds between calls during resize
  debounce?: number; // milliseconds to wait after resize stops
}

export function useResizeObserver<T extends HTMLElement>({ 
  ref, 
  onResize, 
  enabled = true, 
  throttle = 0,
  debounce = 0 
}: UseResizeObserverOptions<T>) {
  const observerRef = useRef<ResizeObserver | null>(null);
  const callbackRef = useRef(onResize);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    observerRef.current = new ResizeObserver((entries) => {
      const now = Date.now();
      const entry = entries[0];

      // Throttle: Execute immediately if enough time has passed
      if (throttle > 0 && now - lastCallRef.current >= throttle) {
        lastCallRef.current = now;
        callbackRef.current(entry);
      } else if (throttle === 0) {
        // No throttling, call immediately
        callbackRef.current(entry);
      }

      // Debounce: Always schedule a final call after activity stops
      if (debounce > 0) {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
          callbackRef.current(entry);
        }, debounce);
      }
    });

    observerRef.current.observe(ref.current);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      observerRef.current?.disconnect();
    };
  }, [ref, enabled, throttle, debounce]);
}


// // useResizeObserver.ts
// import { useEffect, useRef, type RefObject } from 'react';

// interface UseResizeObserverOptions<T extends HTMLElement | null> {
//   ref: RefObject<T>;
//   onResize: (entry: ResizeObserverEntry) => void;
//   enabled?: boolean;
// }

// export function useResizeObserver<T extends HTMLElement | null>({ ref, onResize, enabled = true }: UseResizeObserverOptions<T>) {
//   const observerRef = useRef<ResizeObserver | null>(null);
//   const callbackRef = useRef(onResize);

//   // Keep callback ref updated
//   useEffect(() => {
//     callbackRef.current = onResize;
//   }, [onResize]);

//   useEffect(() => {
//     if (!enabled || !ref.current) return;

//     observerRef.current = new ResizeObserver((entries) => {
//       callbackRef.current(entries[0]);
//     });

//     observerRef.current.observe(ref.current);

//     return () => {
//       observerRef.current?.disconnect();
//     };
//   }, [ref, enabled]);
// }