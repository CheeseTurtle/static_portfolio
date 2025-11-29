import React, { useCallback, useReducer } from "react";
import FSLightbox from "fslightbox-react";
import { createPortal } from "react-dom";
import type { ProjectInfo } from "./types";
import useMutationObserver from "@/hooks/use-mutation-observer";
import { useDomReady } from "@/hooks/use-dom-ready";

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
    | { type: "CLOSE" }
    //   | { type: "SET_SLIDE"; slide: number }
    | { type: "SET_CONTENT", sourceKey: string, sources: LightboxSource[], captions?: LightboxCaptions };

export function lightboxReducer(state: LightboxState, action: LightboxAction): LightboxState {
    switch (action.type) {
        case "OPEN":
            // console.log('Old state:', state);
            return {
                ...state,
                open: true,
                initialSlide: action.slide,
            };
        case "CLOSE":
            return { ...state, open: false };
        // case "SET_SLIDE":
        //   return { ...state, slide: action.slide };
        case 'SET_CONTENT': {
            const {type, ...rest} = action
            if (action.sources !== state.sources || action.captions !== state.captions)
                return { ...state, ...rest };
            return state;
        }
        default:
            return state;
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
    if(!value) throw Error('Turtles');
    return value;
}

// export function useCaptionedLightboxWithProject(project: ProjectInfo) {
//     const {dispatch} = useCaptionedLightbox();
//     const data = projectInfoToLightboxContent(project);
//     if(!data) return null;
//     const {sources, captions} = data;
//     if(!sources?.length) return null;
//     function openLightbox(index: number) {
//         dispatch({type: 'SET_CONTENT', sources, captions});
//         dispatch({type: 'OPEN', slide: index});
//     };
// }
