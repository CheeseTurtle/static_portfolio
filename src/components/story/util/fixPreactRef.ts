// fixPreactRef.ts
// import { useCallback } from 'preact/hooks';
import {useCallback} from 'react';

export function fixPreactRef<T extends HTMLElement>(
  setNode: (el: T | null) => void
) {
  return useCallback((node: any) => {
    if (node && typeof node === 'object' && 'base' in node) {
      setNode(node.base ?? null); // unwrap .base
    } else {
      setNode(node ?? null);
    }
  }, []);
}