import React, { useRef, useState } from "react";


export enum SentinelPosition {
  ABOVE = -1,
  IN_VIEW = 0,
  BELOW = 1,
}

export function useScrollSentinel(container?: HTMLElement | null, threshold: number = 0, invert?: boolean, rootMargin?: string) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState<boolean>(false);
  // const [position, setPosition] = React.useState<SentinelPosition>();

  // React.useInsertionEffect(effect)

  // React.useLayoutEffect(()=>{
    
  // }, [sentinelRef.current]);


  // const [prevTop, setPrevTop] = useState(0);

  // useEffect(() => {
  //   const observer = new IntersectionObserver((entries) => {
  //     const rect = entries[0].boundingClientRect;
  //     if (rect.top < prevTop) {
  //       console.log("scrolling down");
  //     } else {
  //       console.log("scrolling up");
  //     }
  //     setPrevTop(rect.top);
  //   });
  //   observer.observe(ref.current);
  // }, [prevTop]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    // const containerElem = (
    //   typeof container === 'string' ? 
    //   document.getElementById(container)
    //   : container?.current ?? false
    // );
    // if(containerElem === false) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // const rect = entry.boundingClientRect;
        // console.log(rect.top, sentinel.scrollTop + sentinel.scrollHeight, sentinel.clientTop + sentinel.clientHeight, window.screenTop, window.scrollY);

        // entry.isIntersecting === false means sticky element has started sticking
        const val = !(entry.isIntersecting && !(entry.boundingClientRect.y <= 0 || entry.boundingClientRect.bottom <= 0));
        if(invert) setInView(!val)
        else setInView(val);
      },
      {
        root: container ?? null,     // the viewport
        threshold: threshold,        // any visibility
        rootMargin: rootMargin
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef.current, container, invert]);

  return { sentinelRef, inView };
}


export type ValueChangeWatcherProps<T, InitT = T> = {
  value: InitT,
  callback: (value: T, prev: T | InitT) => void,
  equalityFn?: (left: T | InitT, right: T) => boolean,
}

// export function useValueChangeWatcher<T, InitT = T>(value: InitT, callback: (value: T, prev: T | InitT) => void,  opts?: {equalityFn?: (left: T | InitT, right: T) => boolean, fireImmediately?: false}): void;
// export function useValueChangeWatcher<T, InitT = T>(value: InitT, callback: (value: T | InitT, prev?: T | InitT) => void,  opts?: {equalityFn?: (left: T | InitT, right: T) => boolean, fireImmediately: true}): void;
// export function useValueChangeWatcher<T, InitT = T>(value: InitT, callback: ((value: T, prev: T | InitT) => void) | ((value: T | InitT, prev?: T | InitT) => void) ,  opts?: {equalityFn?: (left: T | InitT, right: T) => boolean, fireImmediately?: boolean}) {
//   const prev = useRef<T | InitT>(value);
//   const isFirst = useRef<boolean>(true);

//   const stableCallback = React.useEffectEvent(callback);

//   React.useEffect(()=>{
//     const first = isFirst.current;

//     try {
//       if(first) {
//         isFirst.current = false;
//         if (opts?.fireImmediately)
//           // callback type is (value: T | InitT, prev?: T | InitT)
//           (stableCallback as (v: T | InitT, p?: T | InitT) => void)(value, first ? undefined : prev.current);
//       } else if((opts?.equalityFn ? !opts.equalityFn(prev.current, value as unknown as T) : value !== prev.current)) {
//         // callback type is (value: T, prev: T | InitT)
//         (stableCallback as (v: T, p: T | InitT) => void)(value as unknown as T, prev.current);
//       }
//       // // @ts-ignore
//       // stableCallback(value as unknown as T, first ? undefined : prev.current);
//     } finally {
//       // isFirst.current = false;
//       prev.current = value;
//     }
//   });
// }




function useValueChangeWatcher1<T, InitT = T>(prev: React.RefObject<T | InitT>, isFirst: React.RefObject<boolean>, value: InitT, stableCallback: (value: T, prev: T | InitT) => void,  opts: {equalityFn: (left: T | InitT, right: T) => boolean, fireImmediately?: false}): void;
function useValueChangeWatcher1<T, InitT = T>(prev: React.RefObject<T | InitT>, isFirst: React.RefObject<boolean>, value: InitT, stableCallback: (value: T | InitT, prev?: T | InitT) => void,  opts: {equalityFn: (left: T | InitT, right: T) => boolean, fireImmediately: true}): void;
function useValueChangeWatcher1<T, InitT = T>(prev: React.RefObject<T | InitT>, isFirst: React.RefObject<boolean>, value: InitT, stableCallback: ((value: T, prev: T | InitT) => void) | ((value: T | InitT, prev?: T | InitT) => void) ,  opts: {equalityFn: (left: T | InitT, right: T) => boolean, fireImmediately?: boolean}) {
  // const prev = useRef<T | InitT>(value);
  // const isFirst = useRef<boolean>(true);

  // const stableCallback = React.useEffectEvent(callback);

  React.useEffect(()=>{
    const first = isFirst.current;

    try {
      if(first) {
        isFirst.current = false;
        if (opts.fireImmediately)
          // callback type is (value: T | InitT, prev?: T | InitT)
          (stableCallback as (v: T | InitT, p?: T | InitT) => void)(value, first ? undefined : prev.current);
      } else if(!opts.equalityFn(prev.current, value as unknown as T)) {
        // callback type is (value: T, prev: T | InitT)
        (stableCallback as (v: T, p: T | InitT) => void)(value as unknown as T, prev.current);
      }
      // // @ts-ignore
      // stableCallback(value as unknown as T, first ? undefined : prev.current);
    } finally {
      // isFirst.current = false;
      prev.current = value;
    }
  });

  return null;
}



function useValueChangeWatcher2<T, InitT = T>(prev: React.RefObject<T | InitT>, isFirst: React.RefObject<boolean>, value: InitT, stableCallback: (value: T, prev: T | InitT) => void,  opts?: {fireImmediately?: false}): void;
function useValueChangeWatcher2<T, InitT = T>(prev: React.RefObject<T | InitT>, isFirst: React.RefObject<boolean>, value: InitT, stableCallback: (value: T | InitT, prev?: T | InitT) => void,  opts?: {fireImmediately: true}): void;
function useValueChangeWatcher2<T, InitT = T>(prev: React.RefObject<T | InitT>, isFirst: React.RefObject<boolean>, value: InitT, stableCallback: ((value: T, prev: T | InitT) => void) | ((value: T | InitT, prev?: T | InitT) => void) ,  opts?: {fireImmediately?: boolean}) {
  // const prev = useRef<T | InitT>(value);
  // const isFirst = useRef<boolean>(true);

  // const stableCallback = React.useEffectEvent(callback);

  React.useEffect(()=>{
    const first = isFirst.current;

    try {
      if(first) {
        isFirst.current = false;
        if (opts?.fireImmediately)
          // callback type is (value: T | InitT, prev?: T | InitT)
          (stableCallback as (v: T | InitT, p?: T | InitT) => void)(value, first ? undefined : prev.current);
      } else if(value !== prev.current) {
        // callback type is (value: T, prev: T | InitT)
        (stableCallback as (v: T, p: T | InitT) => void)(value as unknown as T, prev.current);
      }
      // // @ts-ignore
      // stableCallback(value as unknown as T, first ? undefined : prev.current);
    } finally {
      // isFirst.current = false;
      prev.current = value;
    }
  }, [value]);

  return null;
}




export function useValueChangeWatcher<T, InitT = T>(value: InitT, callback: (value: T, prev: T | InitT) => void,  opts?: {equalityFn?: (left: T | InitT, right: T) => boolean, fireImmediately?: false}): void;
export function useValueChangeWatcher<T, InitT = T>(value: InitT, callback: (value: T | InitT, prev?: T | InitT) => void,  opts?: {equalityFn?: (left: T | InitT, right: T) => boolean, fireImmediately: true}): void;
export function useValueChangeWatcher<T, InitT = T>(value: InitT, callback: ((value: T, prev: T | InitT) => void) | ((value: T | InitT, prev?: T | InitT) => void) ,  opts?: {equalityFn?: (left: T | InitT, right: T) => boolean, fireImmediately?: boolean}) {
  const prev = useRef<T | InitT>(value);
  const isFirst = useRef<boolean>(true);

  const stableCallback = React.useEffectEvent(callback);

  React.useEffect(()=>{
    const first = isFirst.current;

    try {
      if(first) {
        isFirst.current = false;
        if (opts?.fireImmediately)
          // callback type is (value: T | InitT, prev?: T | InitT)
          (stableCallback as (v: T | InitT, p?: T | InitT) => void)(value, first ? undefined : prev.current);
      } else if((opts?.equalityFn ? !opts.equalityFn(prev.current, value as unknown as T) : value !== prev.current)) {
        // callback type is (value: T, prev: T | InitT)
        (stableCallback as (v: T, p: T | InitT) => void)(value as unknown as T, prev.current);
      }
      // // @ts-ignore
      // stableCallback(value as unknown as T, first ? undefined : prev.current);
    } finally {
      // isFirst.current = false;
      prev.current = value;
    }
  }); 
}