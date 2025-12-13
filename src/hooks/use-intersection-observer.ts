import * as React from "react"

interface Props {
  threshold?: number | number[]
  root?: Element | Document | null
  rootMargin?: string
}

export function useIntersectionObserver<T extends Element>(
  elementRef: React.RefObject<T | null>,
  { threshold = 0, root = null, rootMargin = "0%" }: Props = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = React.useState<IntersectionObserverEntry>()

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  React.useEffect(() => {
    const node = elementRef.current
    const isSupported = !!window.IntersectionObserver

    if (!node || !isSupported) return

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    })

    observer.observe(node)

    return () => observer.disconnect()
  }, [elementRef, threshold, root, rootMargin])

  return entry
}


export function useIntersectionObserverCallback<T extends Element>(
  elementRef: React.RefObject<T | null>,
  callback?: (entry: IntersectionObserverEntry, observer: IntersectionObserver) =>  void,
  { threshold = 0, root = null, rootMargin = "0%" }: Props = {}
) {
  
  const updateEntry: IntersectionObserverCallback = React.useEffectEvent((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const entry = entries[0];
    if(!entry) return;
    callback?.(entry, observer);
  });

  const observerRef = React.useRef<IntersectionObserver | undefined>(undefined);

  const observe = React.useCallback((target: Element) => observerRef.current?.observe(target), []);
  const unobserve = React.useCallback((target: Element) => observerRef.current?.unobserve(target), []);

  React.useEffect(() => {
    const node = elementRef.current
    const isSupported = !!window.IntersectionObserver

    if (!node || !isSupported) return

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    })

    observer.observe(node)

    observerRef.current = observer;

    return () => {
      try {
        observer.disconnect()
      } finally {
        observerRef.current = undefined
      }
    }
  }, [elementRef, threshold, root, rootMargin])


  return [observe, unobserve]
}

