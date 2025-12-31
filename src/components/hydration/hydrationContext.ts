'use client';


// import type { Loader } from "@/lib/loader-types";
import type { ValueOf } from "node_modules/astro/dist/type-utils";
import React from "react";




export type LoaderMapP<L extends LoaderMap<any,any>> = L extends LoaderMap<infer P, any> ? P : never;
export type LoaderMapT<L extends LoaderMap<any,any>> = L extends LoaderMap<any, infer T> ? T : never;
// export type GetImportWithLoaderMap = <P, T extends React.ComponentType<P> = React.ComponentType<P>, L extends LoaderMap<P,T> = LoaderMap<P,T>>(loaderMap: L, path: keyof L) => React.LazyExoticComponent<T>;
export type GetImportWithLoaderMap = typeof getImportWithLoaderMap;

export type HydrationContextValue = {
    getImport<P, T extends React.ComponentType<P> = React.ComponentType<P>>(path: string): React.LazyExoticComponent<T>,
}





// Build-time loader map (adapt pattern / globs to your project)
/* Example: configure keys that match importPath values used at build time */
// export const loaderMap = import.meta.glob('../../**/*.{tsx,jsx}', { eager: false }) as Record<string, () => Promise<{default: React.ComponentType<any>}>>;
export type LoaderMap<P = any, T extends React.ComponentType<P> = React.ComponentType<P>> = Record<string, (()=>Promise<{default: T}>) | (()=>Promise<T>)>;
export const lazyCache: Record<string, React.LazyExoticComponent<any>> = {};
export const loaderMap = import.meta.glob('@/src/components/**/*.{tsx,jsx}', { eager: false }) as Record<string, () => Promise<{default: React.ComponentType<any>}>>;

function resolveLoader<P, T extends React.ComponentType<P> = React.ComponentType<P>>(path: string) {
    if(path.startsWith('@/'))
        path = '/src/' + path.slice(2)
    // console.log('Resolving path:', path, Object.keys(loaderMap));
    // try exact key or with extension; adjust to match how you reference paths
    const loader = loaderMap[path] ?? loaderMap[`${path}.tsx`] ?? loaderMap[`${path}.jsx`];
    if (!loader) throw new Error(`Unknown hydration path: ${path}`);
    return loader as ValueOf<LoaderMap<P, T>>;
}

function getImport<P, T extends React.ComponentType<P> = React.ComponentType<P>>(path: string) {
    return lazyCache[path] ??= React.lazy(async () => {
        const mod = await resolveLoader<P,T>(path)();
        // @ts-expect-error mod might not have 'default'
        return { default: (mod.default ?? mod) as T };
    });
};



function resolveLoaderWithLoaderMap<P, T extends React.ComponentType<P> = React.ComponentType<P>, L extends LoaderMap<P,T> = LoaderMap<P,T>>(loaderMap: L, path: Extract<keyof L, string>) {
    if(path.startsWith('@/'))
        path = '/src/' + path.slice(2) as Extract<keyof L, string>;
    // console.log('Resolving path:', path, Object.keys(loaderMap));
    // try exact key or with extension; adjust to match how you reference paths
    const loader = loaderMap[path] ?? loaderMap[`${path}.tsx`] ?? loaderMap[`${path}.jsx`];
    if (!loader) {
        console.log(loaderMap);
        throw new Error(`Unknown hydration path: ${path}`);
    }
    return loader as (()=>Promise<{default: T}>) | (()=>Promise<T>)
}

function isDefaultObject<T extends React.ComponentType<any>>(mod: T | {default: T}): mod is {default: T} {
    return Object.hasOwn(mod, 'default');
}

function ensureDefaultObject<T extends React.ComponentType<any>>(mod: T | {default: T}): {default: T} {
    if(isDefaultObject(mod)) return mod;
    // @ts-expect-error mod might not have 'default'
    return { default: (mod.default ?? mod) as T };
}

export const getImportWithLoaderMap = function <P,T extends React.ComponentType<P> = React.ComponentType<P>,L extends LoaderMap<P,T> = LoaderMap<P,T>>(loaderMap: L, path: Extract<keyof L, string>) {
    const ret = React.lazy<T>(async () => {
        const loader = resolveLoaderWithLoaderMap<P,T,L>(loaderMap, path);
        const loaderPromise = loader();
        const mod = await loaderPromise;
        return ensureDefaultObject<T>(mod);
    });
    return (lazyCache[path] ??= ret) as typeof ret;
}

const defaultValue = ({getImport: getImport});

export const HydrationContext = React.createContext<HydrationContextValue | null>(defaultValue);




export function useHydrationContext() {
    const value = React.useContext(HydrationContext);
    if(!value) throw new Error('Not in HydrationContext Provider');
    return value;
}
