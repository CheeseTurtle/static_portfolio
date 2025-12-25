import React from "react";
import { scopeSelectors } from "./scopeSelectors";

import type {InferCustomEventPayload, CustomEventName} from 'vite/types/customEvent.d.ts';
import type { Update } from "vite";
import useSyncedRef from "@/hooks/useSyncedRef";
// import type { ViteHotContext } from "vite/types/hot.d.ts";

type ThemeName = 'default' | 'colorblind' | 'dimmed' | 'high-contrast' | 'tritanopia' | 'core' | 'original';

const themeFiles = (import.meta.hot ? import.meta.glob<string>('/src/styles/starry-night/*.css', { query: '?raw', import: 'default' }) : undefined);
// console.log('themeFiles:', themeFiles);

// if(import.meta.hot) {
//     import.meta.hot.on('theme-update', () => {
//         import.meta.hot?.invalidate('Theme files');
//     })
// }


function getLightAndDarkNames(theme: ThemeName): [light: string, dark: string] {
    switch(theme) {
        case 'dimmed':
            return ['dimmed', 'dimmed-dark'];
        case 'core':
            return ['core', 'core'];
        case 'original':
            return ['light', 'dark'];
        default:
            return [theme + '-light', theme + '-dark'];
    }
}



// let starryNightPromise: Promise<string> | null = null;

const starryNightPromises: Partial<Record<ThemeName, Promise<string>>> = {};


// function makeThemeFilePath(name: string) {
//     return `/styles/starry-night/${name}.css`;
// }


async function getCSS(path: string, bustCache: boolean = false) {
    const themeFileLoader = themeFiles?.['/src' + path];
    // return themeFileLoader?.() || fetch(path).then(r=>r.text());
    
    if (themeFileLoader && !bustCache) {
        return await themeFileLoader();
    }
    
    // In dev, Vite serves /src files; add cache buster
    const url = bustCache && import.meta.hot 
        ? `${path}?t=${Date.now()}` 
        : path;
    
    return fetch(url).then(r => r.text());
}

async function fetchThemeCSS(lightName: string, darkName: string, bustCache: boolean = false): Promise<string> {
    const lightPromise = getCSS(`/styles/starry-night/${lightName}.css`, bustCache);
    if(lightName === darkName)
        return await lightPromise;
    const darkPromise = getCSS(`/styles/starry-night/${darkName}.css`, bustCache).then(text=>scopeSelectors(text, '.dark'));
    const [light, dark] = await Promise.all([lightPromise, darkPromise]);
    return light + dark;
}
// async function importThemeCSS(lightName: string, darkName: string): Promise<string> {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//     const lightPromise = import(`../styles/starry-night/${lightName}.css?inline`).then(r=>r.default as string);
//     if(lightName === darkName)
//         return await lightPromise;
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//     const darkPromise = import(`../styles/starry-night/${darkName}.css?inline`).then(r=>r.default as string).then(text=>scopeSelectors(text, '.dark'));
//     const [light, dark] = await Promise.all([lightPromise, darkPromise]);
//     return light + dark;
// }

function getStarryNightCSS(theme: ThemeName, reload: boolean = false) {
    let promise: Promise<string> | undefined = reload ? undefined : starryNightPromises[theme];
    if(!promise) {
        const [lightName, darkName] = getLightAndDarkNames(theme);
        promise = starryNightPromises[theme] = fetchThemeCSS(lightName, darkName, reload);
    }
    return promise;
}


// type ViteHotContext = Defined<ReturnType<typeof useIMH>>;
type ViteEventHandler<T extends CustomEventName> = (payload: InferCustomEventPayload<T>) => void;


function useIMH() {
    const IMH = React.useMemo(()=>(import.meta.env.PROD && !import.meta.env.DEV) ? undefined : import.meta.hot, []);
    return IMH;
}




function StarryNightStyleHMR({theme, /*importMetaHot,*/ themeSourceRef, setThemeSource}: {theme: ThemeName, /*importMetaHot: ViteHotContext | undefined,*/ themeSourceRef: React.RefObject<string | null>, setThemeSource: React.Dispatch<React.SetStateAction<string | null>>, }) {
    const importMetaHot = useIMH();

    const themeRef = useSyncedRef(theme);
    
    React.useInsertionEffect(()=>{
        if(!importMetaHot) return;
        // const [lightPath, darkPath] = getLightAndDarkNames(theme).map(makeThemeFilePath);
        const callbackInner = async (_when: 'before' | 'after', updates: Update[])=>{
            // console.log('callbackInner:', themeSourceRef, getStarryNightCSS, setThemeSource)
            // console.log('Updates:', updates);
            if(!updates.some(x=>(x.type === 'css-update' || x.path.endsWith('.css') || x.acceptedPath.endsWith('.css'))))
                return;
            const themeSource = await getStarryNightCSS(theme, true).then(css=>(css === themeSourceRef.current ? true : css));
            if(themeSource === true) {
                // console.log('Skipping identical (hot update)');
                return;
            }
            // console.log('SETTING THEME SOURCE (hot update)')
            setThemeSource(themeSource);
            // themeSourceRef.current = themeSource;
        }
        const callback: ViteEventHandler<'vite:beforeUpdate'> = (({updates})=> void callbackInner('before', updates));
        // const callbackAfter: ViteEventHandler<'vite:afterUpdate'> = (({type, updates})=> void callbackInner('after', updates));

        // const loadCallback: ViteEventHandler<'vite:beforeFullReload'> = ({path, triggeredBy}) => {
        //     console.log('Before full reload:', path, triggeredBy);
        // };

        importMetaHot.on('vite:afterUpdate', callback);
        // importMetaHot.on('vite:afterUpdate', callbackAfter);
        return ()=>{
            importMetaHot.off('vite:afterUpdate', callback);
            // importMetaHot.off('vite:afterUpdate', callbackAfter);
        }
    }, [theme, importMetaHot, themeSourceRef, setThemeSource]);

    React.useInsertionEffect(()=>{
        if(!importMetaHot) return;
        const themeUpdateCallbackInner = async ({themeName}: {themeName: string}) => {
            // console.log('THEME UPDATE:', themeName, themeRef.current);
            if(themeRef.current && themeName && !themeName.startsWith(themeRef.current)) return;
            const themeSource = await getStarryNightCSS(themeRef.current, true).then(css=>{
                if(css !== themeSourceRef.current) return css;
                // console.log(themeSourceRef.current, css);
                return true;
            });
            if(themeSource === true) {
                // console.log('Skipping identical (theme update)');
                return;
            }
            // console.log('UPDATING THEME CSS (theme update):', themeName, themeRef.current);
            setThemeSource(themeSource);

            // // Invalidate this module to refresh the glob imports
            // importMetaHot.invalidate();
            
            // // Note: code after invalidate() won't run because module is reloading
        }

        const themeUpdateCallback = (payload: {themeName: string}) => {
            void themeUpdateCallbackInner(payload);
        }

        importMetaHot.on('theme-update', themeUpdateCallback);

        return () => {
            importMetaHot.off('theme-update', themeUpdateCallback);
        }

    }, [themeRef, importMetaHot, setThemeSource, themeSourceRef])

    return null;
}

export default function StarryNightStyleInjector({theme = 'default'}: {theme: ThemeName}) {
    const [themeSource, setThemeSource] = React.useState<string | null>(null);
    const themeSourceRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        let alive = true;

        void getStarryNightCSS(theme).then(result => {
            if (alive) {
                setThemeSource(result);
                // React.startTransition(()=>setThemeSource(result));
                // alive = false;
            }
        });

        return () => {
            alive = false;
        };
    }, [theme]);


    const styleElemRef = React.useRef<HTMLStyleElement | null>(null);

    const updateStyleElem = React.useCallback((themeSource: string, theme: ThemeName) => {
        if(!styleElemRef.current || !styleElemRef.current.isConnected) {
            const newElem = document.createElement('style');
            document.head.appendChild(newElem);
            styleElemRef.current = newElem;
        }
        try {
            styleElemRef.current.dataset.starryNightTheme = theme;
            styleElemRef.current.textContent = themeSource;
        } catch(e) {
            styleElemRef.current?.remove();
            styleElemRef.current = null;
            throw e;
        }
        return styleElemRef.current;
    }, []);

    React.useInsertionEffect(() => {
        themeSourceRef.current = themeSource;
        if (!themeSource) {
            styleElemRef.current?.remove();
            styleElemRef.current = null;
            return;
        }

        void updateStyleElem(themeSource, theme);

        // return () => {
        //     styleElem.remove();
        //     themeSourceRef.current = null;
        // }
    }, [themeSource, theme]);

    React.useInsertionEffect(()=>{
        return ()=>{
            styleElemRef.current?.remove();
            styleElemRef.current = null;
        }
    }, [])

    return <StarryNightStyleHMR theme={theme} themeSourceRef={themeSourceRef} setThemeSource={setThemeSource}/>;
}


