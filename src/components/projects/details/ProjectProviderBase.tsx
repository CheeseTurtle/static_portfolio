import React from "react";
import type { ProjectInfo } from "../types";
import { transformTree } from "./transformTree";
import { useCaptionedLightbox } from "../lightbox";

type ContentKeys = 'contentMdx' | 'contentHtml' | 'contentElem' | 'images';
export type ProjectInfoForProvider = Omit<ProjectInfo, ContentKeys>;

export type ProjectProviderBaseProps = {
    project: ProjectInfoForProvider,
    replacePlaceholder: (node: React.JSX.Element) => React.JSX.Element,

}

export type ProjectContextState = {
    project: ProjectInfoForProvider,
    openLightbox: (key: string, source: React.JSX.Element | string, caption?: React.JSX.Element | null) => void,
}

export const ProjectContext = React.createContext<ProjectContextState | null>(null);


export default function ProjectProviderBase({project, children, replacePlaceholder, ...props}: ProjectProviderBaseProps & Omit<React.ComponentProps<typeof ProjectContext.Provider>, 'value'>) {
    
    const transformedChildren = React.useMemo(()=>{
        return transformTree(children, replacePlaceholder);
    }, [children, replacePlaceholder]);

    const {dispatch} = useCaptionedLightbox();
    
    const openLightbox = React.useCallback((key: string, source: React.JSX.Element | string, caption?: React.JSX.Element | null)=>{

        dispatch({type: 'CLEAR_PROJECT'});
        dispatch({type: 'SET_CONTENT', sourceKey: key, sources: [source], captions: [caption || null]});
        dispatch({type: 'OPEN', slide: 1});
    }, [dispatch]);
    
    return <ProjectContext.Provider value={{project, openLightbox}} {...props}>
        {transformedChildren}
    </ProjectContext.Provider>
}