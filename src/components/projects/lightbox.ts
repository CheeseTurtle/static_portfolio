import React, { useCallback, useReducer } from "react";
import FSLightbox from "fslightbox-react";
import { createPortal } from "react-dom";
import type { ProjectInfo } from "./types";
import useMutationObserver from "@/hooks/use-mutation-observer";
import { useDomReady } from "@/hooks/use-dom-ready";



// type ConvertSymbol = {
//     (x: symbol | string): string,
//     (x: null): null
// };
// export const convertSymbol: ConvertSymbol = x => (typeof x === 'symbol' ? ('%'+String(x)+'%') : x);


export function convertSymbol(x: symbol | string): string;
export function convertSymbol(x: null): null;
export function convertSymbol(x: symbol | string | null): string | null;
export function convertSymbol(x: symbol | string | null): string | null {
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
    | { type: "OPEN"; slide: number }
    | { type: 'ENSURE_OPEN', slide?: number }
    | { type: "CLOSE" }
    | { type: "SET_CONTENT", sourceKey: string, sources: LightboxSource[], captions?: LightboxCaptions }
    | { type: 'SET_PROJECT', projectId: string, projectIndex: number,}
    | { type: 'CLEAR_PROJECT' }

export function lightboxReducer(state: LightboxState, action: LightboxAction): LightboxState {
    const result = (()=>{
        switch (action.type) {
            case "OPEN":
                // console.log('Old state:', state);
                return {
                    ...state,
                    open: true,
                    initialSlide: action.slide,
                };
            case "ENSURE_OPEN":
                return {
                    ...state,
                    open: true,
                    initialSlide: (action.slide === undefined ? state.initialSlide : action.slide)
                }
            case "CLOSE":
                return { ...state, activeProjectIndex: undefined, activeProjectId: undefined, open: false };
            // case "SET_SLIDE":
            //   return { ...state, slide: action.slide };
            case 'SET_PROJECT': {
                return {...state, ...action};
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
    const {type, ...params} = action;
    console.log('LIGHTBOX REDUCER ACTION', type, params, state, result);
    return result;
}


type LightboxContextState = {
    state: LightboxState,
    dispatch: React.Dispatch<LightboxAction>,
    // lightbox: React.RefObject<CaptionedLightboxProps>
}


export const LightboxContext = React.createContext<LightboxContextState | null>(null)

export function useCaptionedLightbox() {
    const value = React.useContext(LightboxContext);
    if(!value) throw Error('Turtles');
    return value;
}
