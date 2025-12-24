import React from "react";
import { scopeSelectors } from "./scopeSelectors";


type ThemeName = 'default' | 'colorblind' | 'dimmed' | 'high-contrast' | 'tritanopia' | 'core';


function getLightAndDarkNames(theme: ThemeName): [light: string, dark: string] {
    switch(theme) {
        case 'dimmed':
            return ['dimmed', 'dimmed-dark'];
        case 'core':
            return ['core', 'core'];
        case 'default':
            return ['light', 'dark'];
        default:
            return [theme + '-light', theme + '-dark'];
    }
}



// let starryNightPromise: Promise<string> | null = null;

const starryNightPromises: Partial<Record<ThemeName, Promise<string>>> = {};

function getStarryNightCSS(theme: ThemeName) {
    let promise: Promise<string> | undefined = starryNightPromises[theme];
    if(!promise) {
        const [lightName, darkName] = getLightAndDarkNames(theme);
        promise = starryNightPromises[theme] = (async () => {
            const [light, dark] = await Promise.all([
                fetch(`/styles/${lightName}.css`).then(r=>r.text()),
                fetch(`/styles/${darkName}.css`).then(r=>r.text()).then(text=>scopeSelectors(text, '.dark'))
            ])

            console.log('LIGHT/DARK:', light, dark);

            return light + dark;
        })();
    }
    return promise;
}



export default function StarryNightStyleInjector({theme = 'default'}: {theme: ThemeName}) {
    const [themeSource, setThemeSource] = React.useState<string | null>(null);

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

    React.useLayoutEffect(() => {
        if (!themeSource) return;

        const styleElem = document.createElement("style");
        styleElem.dataset.theme = "starry-night";
        styleElem.textContent = themeSource;

        document.head.appendChild(styleElem);

        return () => styleElem.remove();
    }, [themeSource, theme]);

  return null;
}
