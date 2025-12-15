import React from "react";
import { CountStoreContext, createCountStore, type CountStore, type CountStoreInitProps } from "./countStore";
import { useBrowserStore } from "../browserContext";
import { useStore } from "zustand";


export function CountStoreProvider({children, ...props}: React.PropsWithChildren<Partial<CountStoreInitProps>>) {
    const browserStore = props.browserStore ?? useBrowserStore();
    const allProjects = props.allProjects ?? useStore(browserStore, s=>s.allProjects);
    const storeRef = React.useRef<CountStore>(null);
    if(!storeRef.current)
        storeRef.current = createCountStore({browserStore, allProjects});
    return <CountStoreContext.Provider value={storeRef.current}>{children}</CountStoreContext.Provider>
}
