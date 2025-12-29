import { useRef, useCallback, useEffect } from 'react';

interface UseFlipAnimationOptions {
  onFlipStart?: () => void;
  onFlipEnd?: () => void;
  maxDuration?: number; // Safety timeout in ms
  targets?: gsap.DOMTarget,
}

export function useFlipAnimation(options: UseFlipAnimationOptions = {}) {
  const { onFlipStart, onFlipEnd, maxDuration = 1000, targets } = options;
  const isFlippingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const endFlip = useCallback(() => {
    if (!isFlippingRef.current) return;
    
    isFlippingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    onFlipEnd?.();
  }, [onFlipEnd]);

  const killFlip = useCallback(()=>{
    if(!targets) return;
    if(!Array.isArray(targets) || targets.length)
      Flip.killFlipsOf(targets);
  }, [targets]);

  const startFlip = useCallback(() => {
    if (isFlippingRef.current) {
      // Already flipping, clear old timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      isFlippingRef.current = true;
      onFlipStart?.();
    }
    
    // Safety timeout - force end if animation doesn't complete
    timeoutRef.current = setTimeout(() => {
      console.warn('FLIP animation timeout - forcing end');
      try {
        endFlip();
      } finally {
        killFlip();
      }
    }, maxDuration);
  }, [onFlipStart, killFlip, endFlip, maxDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    isFlippingRef,
    get isFlipping() {
      return isFlippingRef.current;
    },
    startFlip,
    endFlip,
  };
}