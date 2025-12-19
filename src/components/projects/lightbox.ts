import React from "react";
import type { ProjectInfo, ProjectMediaEmbedData } from "./types";
import type { CaptionedLightboxHandle } from "./CaptionedLightbox";



// type ConvertSymbol = {
//     (x: symbol | string): string,
//     (x: null): null
// };
// export const convertSymbol: ConvertSymbol = x => (typeof x === 'symbol' ? ('%'+String(x)+'%') : x);


export function convertSymbol(x: ProjectMediaEmbedData): ProjectMediaEmbedData;
export function convertSymbol(x: symbol | string): string;
export function convertSymbol(x: null): null;
export function convertSymbol(x: symbol | string | ProjectMediaEmbedData | null): string | null | ProjectMediaEmbedData;
//export function convertSymbol(x: symbol | string | {sym: symbol, key: string, path: string, caption?: string} | null): string | null | {sym: symbol, key: string, path: string, caption?: string} {
export function convertSymbol(x: symbol | string | ProjectMediaEmbedData | null): string | null | ProjectMediaEmbedData {
    // if(x && typeof x === 'object') return `%${x.key}%`;
    // if(x && typeof x !== 'symbol' && typeof x !== 'string')
    //     throw TypeError(`Unexpected type: ${typeof x} (${x})`);
    return typeof x === 'symbol' ? `%${x.toString()}%` : x;
}

export type CaptionedLightboxProps = {
    initialSlide: number,
    sources: LightboxSources;
    captions?: LightboxCaptions; // Array<string | React.ReactNode>; // HTML or JSX
    open: boolean;
    onClose?: () => void;
};

export type LightboxState = {
    open: boolean;
    initialSlide: number;
    sources: LightboxSources;
    captions?: LightboxCaptions;
    sourceKey?: string,
    activeProjectIndex?: number,
    activeProjectId?: string,
    enableOpenDetails?: boolean,
};

// type ImagePath = string;

// type YouTubeLink = {
//     url: string,
//     type: "youtube",
// };

export function projectInfoToLightboxContent(project: ProjectInfo) {
    const sources: (string | React.JSX.Element)[] | undefined = project.lightboxData?.lightboxSources;
    if(!sources?.length) return null;
    const captions = project.lightboxData?.lightboxCaptions; //new Array(sources.length).fill(null) : 
    return {sources, captions};
}

export type LightboxSource = string | React.JSX.Element;
export type LightboxSources = Array<string | React.JSX.Element> | undefined;

export type LightboxCaption = string | React.ReactNode;
export type LightboxCaptions = Array<LightboxCaption | null>;

export type LightboxAction =
    | { type: "OPEN"; slide: number, enableOpenDetails?: boolean }
    | { type: 'ENSURE_OPEN', slide?: number }
    | { type: "CLOSE" }
    | { type: "SET_CONTENT", sourceKey: string, sources: LightboxSource[], captions?: LightboxCaptions }
    | { type: 'SET_PROJECT', projectId: string, projectIndex: number,}
    | { type: 'CLEAR_PROJECT' }

export function createLightboxReducer(lightboxHandle: React.RefObject<CaptionedLightboxHandle | null>) {
    return (state: LightboxState, action: LightboxAction): LightboxState => {
        const result = (()=>{
            switch (action.type) {
                case "OPEN":
                    return {
                        ...state,
                        open: true,
                        initialSlide: action.slide,
                        enableOpenDetails: undefined === action.enableOpenDetails ? state.enableOpenDetails : action.enableOpenDetails,
                    };
                case "ENSURE_OPEN":
                    return {
                        ...state,
                        open: true,
                        initialSlide: (action.slide === undefined ? state.initialSlide : action.slide)
                    }
                case "CLOSE": {
                    lightboxHandle.current?.hideCaptions()
                    return { ...state, activeProjectIndex: undefined, activeProjectId: undefined, open: false };
                }
                case 'SET_PROJECT': {
                    return {...state, activeProjectId: action.projectId, activeProjectIndex: action.projectIndex };
                }
                case "CLEAR_PROJECT":
                    return {...state, activeProjectIndex: undefined, activeProjectId: undefined};
                case 'SET_CONTENT': {
                    const {type, ...rest} = action
                    if (action.sources !== state.sources || action.captions !== state.captions)
                        return { ...state, ...rest };
                    return state;
                }
                default:
                    return state;
            }
        })();
        // const {type, ...params} = action;
        // console.log('LIGHTBOX REDUCER ACTION', type, params, state, result);
        return result;
    }
}


type LightboxContextState = {
    state: LightboxState,
    dispatch: React.Dispatch<LightboxAction>,
    // lightbox: React.RefObject<CaptionedLightboxProps>
}


export const LightboxContext = React.createContext<LightboxContextState | null>(null)

export function useCaptionedLightbox() {
    const value = React.useContext(LightboxContext);
    if(!value) throw Error('Not inside CaptionedLightbox context provider');
    return value;
}
