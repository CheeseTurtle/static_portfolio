import React from "react";
import { createCountStore, type CountStore, type CountStoreInitProps, type CountStoreState } from "./countStore";
import { useBrowserStore } from "../browserContext";
import { useStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

const CountStoreContext = React.createContext<CountStore | null>(null);

export function CountStoreProvider({children}: React.PropsWithChildren<{}>) {
    const browserStore = useBrowserStore();
    const allProjects = useStore(browserStore, s=>s.allProjects);
    const storeRef = React.useRef<CountStore>(null);
    if(!storeRef.current)
        storeRef.current = createCountStore({allProjects, browserStore});
    return <CountStoreContext.Provider value={storeRef.current}>{children}</CountStoreContext.Provider>
}


export function useCountStore() {
    const store = React.useContext(CountStoreContext);
    if (!store) throw new Error('Missing CountStoreContext.Provider in the tree');
    return store;
}


export function useCountContext<T>(
    selector: (state: CountStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean,
): T {
    const store = React.useContext(CountStoreContext);
    if (!store) throw new Error('Missing BrowserStoreContext.Provider in the tree');
    // return useStoreWithEqualityFn(store, selector, (a: any, b: any) => {
    //     const result = a === b;
    //     console.log('COMPARING:', a, b, result);
    //     return result;
    // });
    // return useStoreWithEqualityFn(store, selector, equalityFn);
    // return useStore(store, selector);
    // console.log(selector);
    return equalityFn 
        ? useStoreWithEqualityFn(store, selector, equalityFn) 
        : useStore(store, selector);
}


