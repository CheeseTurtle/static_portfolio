import { useStoreWithEqualityFn } from "zustand/traditional";
import { type FilterStoreState } from "./stores/filterStore";
import { type ScrollToFn, type ShowToastFn } from "./filterTypes";
import React from "react";
import { useStore } from "zustand";
import type { BrowserStore, BrowserStoreInitProps, BrowserStoreState } from "./stores/browserStore";
import { createBrowserStore } from "./stores/browserStore";
import type { EntriesOf } from "@/lib/type-utils";


// Context setup
const BrowserStoreContext = React.createContext<{store: BrowserStore, debounced: ReturnType<typeof createBrowserStore>[1]} | null>(null);

type BrowserStoreProviderProps = React.PropsWithChildren<BrowserStoreInitProps> & {
    showToast?: ShowToastFn;
    scrollTo?: ScrollToFn;
};

function BrowserStoreContextInner({ 
    children, 
    store, 
    showToast 
}: { 
    children: React.ReactNode; 
    store: BrowserStore;
    showToast: ShowToastFn;
}) {
    // Initialize from URL on mount
    const hasInitialized = React.useRef(false);
    
    React.useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        
        (store.getState().initFromUrl(window.location.search, showToast))
        // useCountContext(s=>s.updateCounts)(store.getState().allProjects);
    }, [showToast, store]);
    
    // Handle browser back/forward
    React.useEffect(() => {
        const handlePopState = () => {
            store.getState().handlePopState(showToast);
        };
        
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [showToast, store]);
    
    return <>{children}</>;
}

export function BrowserStoreProvider({ 
    children, 
    scrollTo,
    showToast = (msg) => console.warn(msg),
    ...props 
}: BrowserStoreProviderProps) {
    const storeRef = React.useRef<BrowserStore | null>(null);
    const deferredRef = React.useRef<ReturnType<typeof createBrowserStore>[1]>(null);
    if (!storeRef.current) {
        [storeRef.current, deferredRef.current] = createBrowserStore(props, scrollTo);
    }
    
    return (
        <BrowserStoreContext.Provider value={{store: storeRef.current, debounced: deferredRef.current!}}>
            <BrowserStoreContextInner store={storeRef.current} showToast={showToast}>
                {children}
            </BrowserStoreContextInner>
        </BrowserStoreContext.Provider>
    );
}


export const doubleEq =(a: any, b: any) => (a==b);
export const tripleEq =(a: any, b: any) => (a===b);


export function useBrowserStore() {
    const value = React.useContext(BrowserStoreContext);
    if (!value) throw new Error('Missing BrowserStoreContext.Provider in the tree');
    return value.store;
}


export function useFilterStore() {
    const store = useBrowserContext(state=>state.filterStore);
    return store;
}
export function useBrowserContext<T>(
    selector: (state: BrowserStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean,
): T {
    const ctx = React.use(BrowserStoreContext);
    if (!ctx) throw new Error('Missing BrowserStoreContext.Provider in the tree');
    return equalityFn 
        ? useStoreWithEqualityFn(ctx.store, selector, equalityFn) 
        : useStore(ctx.store, selector);
}

export function useFilterContext<T>(
    selector: (state: FilterStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean,
): T {
    const filterStore = useBrowserContext(state => state.filterStore);
    return equalityFn
        ? useStoreWithEqualityFn(filterStore, selector, equalityFn)
        : useStore(filterStore, selector);
}


export function useFilterContextItems<K extends (keyof FilterStoreState)>(keys: K[], equalityFn?: (left: Pick<FilterStoreState, K>, right: Pick<FilterStoreState, K>) => boolean): Pick<FilterStoreState, K> {
    return useFilterContext(state=>Object.fromEntries(keys.map(k=>[k, state[k]]) as EntriesOf<FilterStoreState>) as Pick<FilterStoreState, K>, equalityFn);
}

export function useBrowserContextItems<K extends (keyof BrowserStoreState)>(keys: K[], equalityFn?: (left: Pick<BrowserStoreState, K>, right: Pick<BrowserStoreState, K>) => boolean): Pick<BrowserStoreState, K> {
    return useBrowserContext(state=>Object.fromEntries(keys.map(k=>[k, state[k]]) as EntriesOf<BrowserStoreState>) as Pick<BrowserStoreState, K>, equalityFn);
}