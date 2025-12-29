'use client';
// import type { Loader } from "@/lib/loader-types";
import type { ValueOf } from "node_modules/astro/dist/type-utils";
import React from "react";
import { HydrationContext, lazyCache, type LoaderMap } from "./hydrationContext";





export default function HydrationProvider({children, loaderMap}: {loaderMap: LoaderMap, children?: React.ReactNode}) {
    // const lazyCache = React.useRef<Record<string, React.LazyExoticComponent<any>>>({});
    const resolveLoader = React.useCallback(function <P, T extends React.ComponentType<P> = React.ComponentType<P>>(path: string) {
        if(path.startsWith('@/'))
            path = '/src/' + path.slice(2)
        // try exact key or with extension; adjust to match how you reference paths
        const loader = loaderMap[path] ?? loaderMap[`${path}.tsx`] ?? loaderMap[`${path}.jsx`];
        if (!loader) {
            console.log(loaderMap);
            throw new Error(`Unknown hydration path: ${path}`);
        }
        return loader as ValueOf<LoaderMap<P, T>>;
    }, [loaderMap]);

    const getImport = React.useCallback(function <P, T extends React.ComponentType<P> = React.ComponentType<P>>(path: string) {
        return lazyCache[path] ??= React.lazy(async () => {
            const mod = await resolveLoader<P,T>(path)();
            // @ts-expect-error mod might not have 'default'
            return { default: (mod.default ?? mod) as T };
        });
    }, [resolveLoader]);

    const value = React.useMemo(()=>({
        getImport
    }), [getImport])


    return <HydrationContext.Provider value={value}>
        {children}
    </HydrationContext.Provider>
}
