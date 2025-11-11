import { createContext, useContext } from 'react';

const VisualOrderResetContext = createContext<() => void>(() => {
  console.warn('VisualOrderResetContext used outside provider');
});

export function useVisualOrderReset() {
  return useContext(VisualOrderResetContext);
}