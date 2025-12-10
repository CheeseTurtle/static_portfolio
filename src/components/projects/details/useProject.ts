import React from "react";
import { ProjectContext } from "./ProjectProvider";



export default function useProject() {
    const state = React.useContext(ProjectContext);
    if(!state) throw new Error('Not in a project context');
    return state;
}

export function useProjectLightboxData() {
    const {project, openLightbox} = useProject();
    // const result = useProject();
    // if(!result) return undefined;
    // const {lightboxData} = result;
    const {lightboxData} = project;
    if(lightboxData?.lightboxSources.length) return [lightboxData, openLightbox] as [typeof lightboxData, typeof openLightbox];
    return [undefined, undefined] as [undefined, undefined];
}
