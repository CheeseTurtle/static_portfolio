import React from 'react';

// import type * as GSAPAll from 'gsap/all';
type GSAPAll = typeof import ('gsap/all');

type GSAPModule = (typeof import('gsap'));

type GSAP = GSAPModule['gsap'];






// import {CSSPlugin} from 'gsap';

// function getGSAP(): Promise<typeof gsap>;
// function getGSAP(pluginName?: undefined): Promise<typeof gsap>;
// function getGSAP<T extends GSAPPluginName>(pluginName: T): ([T] extends [GSAPPluginName] ? Promise<T> : never);
// function getGSAP(pluginName?: GSAPPluginName): Promise<typeof gsap> | Promise<GSAPPlugin> {

// } 


// function convertPluginNameToImport(pluginName: GSAPPluginName): string {
//     switch (pluginName) {
//     }
//     return pluginName[0].toUpperCase() + pluginName.slice(1);
// }

function getGSAP(state: GSAPRegistrationState): Promise<typeof gsap>;
function getGSAP(state: GSAPRegistrationState, pluginName?: undefined): Promise<typeof gsap>;
function getGSAP<T extends GSAPPluginName>(state: GSAPRegistrationState, pluginName: T): ([T] extends [GSAPPluginName] ? Promise<T> : never);
function getGSAP(state: GSAPRegistrationState, pluginName?: GSAPPluginName): Promise<typeof gsap> | Promise<GSAPPlugin> {
    if(pluginName) {
        if(state.plugins[pluginName]) return state.plugins[pluginName];
    }
} 

// type GSAPPluginRecord = Omit<(typeof gsap)['plugins'], 'attr' | 'modifiers' | 'snap' | 'ScrollTriggerInstance' | 'ScrollTriggerStatic'> // also endArray
// type GSAPPluginName = keyof GSAPPluginRecord;
// type GSAPPlugin<T extends GSAPPluginName = GSAPPluginName> = GSAPPluginRecord[T];



type GSAPPluginName = 'Flip' | 'ScrollTrigger' | 'ScrollSmoother' | 'CustomBounce' | 'CustomEase' | 'SplitText' | 'CSSRule' | 'Draggable' | 'DrawSVG' | 'Easel' | 'GSDevTools' | 'Inertia' | 'MorphSVG' | 'MotionPath' | 'MotionPathHelper' | 'Observer' | 'Physics2D' | 'PhysicsProps' | 'Pixi' | 'ScrambleText' | 'Text' | 'ScrollTo';
// type GSAPPluginName_suffixed<T extends Exclude<GSAPPluginName, keyof GSAPAll> = Exclude<GSAPPluginName, keyof GSAPAll>> = {[P in `${T}Plugin`]: [P] extends [keyof GSAPAll] ? true : false};

type GSAPPluginName_suffixed<T extends GSAPPluginName = Exclude<GSAPPluginName, keyof GSAPAll>> = `${T}Plugin` extends keyof GSAPAll ? `${T}Plugin` : never;
type _GSAPPluginNamesWithSuffix = GSAPPluginName_suffixed;
type _GSAPPluginNamesWithoutSuffix = Exclude<GSAPPluginName, keyof GSAPAll>;


// type EaselImport = typeof import('gsap/EaselPlugin').default;
// type EaselPlugin = GSAPAll['EaselPlugin'];

type GSAPPluginRecord = {[T in GSAPPluginName]: (T extends keyof GSAPAll ? GSAPAll[T] : GSAPAll[GSAPPluginName_suffixed<T>])};
type GSAPPlugin<T extends GSAPPluginName = GSAPPluginName> = GSAPPluginRecord[T];


export type GSAPRegistrationState = {
    promises: Partial<{[0]: Promise<GSAP>} & {[T in GSAPPluginName]: Promise<()=>GSAPPlugin<T>>}>,
    gsap?: GSAP,
    plugins: Partial<GSAPPluginRecord>,
}
export interface GSAPContextValue {
    registrationState: GSAPRegistrationState,
}


const createGSAPContextValue = () => {

    return ({

            
    })
}

const GSAPContext = React.createContext<GSAPContextValue | null>()