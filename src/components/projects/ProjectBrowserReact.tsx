import React, { forwardRef, StrictMode, useCallback, useEffect, useEffectEvent, useImperativeHandle, useInsertionEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react"
import ProjectGrid from "./grid/ProjectGrid";
// import ProjectCarousel from "./overlay/ProjectCarousel";
import ProjectCarouselDialog from "./overlay/ProjectCarouselDialog";
import type { ProjectInfo, TagKey } from "./types";
import FilterSheet, { type FilterSpec } from "./filtering/FilterSheet";
import parse from "html-react-parser";
// import { FilterProvider, useFilter } from "./filtering/common/filterContext";
import { collectFilterRangeInfo, getProjectKeyFromTagType, TAGTYPES, type FilterRangeInfo, type FilterState, type TagType } from "./filtering/common/filterTypes";
// import { FilterURLSync, parseURL, ProjectURLSync, useInitializeFilterFromURL, useInitializeFromURL } from "./filtering/sync";
import AlertToast from "./toasts";

import {shallow} from "zustand/shallow";
import { BrowserStoreProvider, doubleEq, useBrowserContext, useFilterContext, type ScrollToFn } from "./filtering/common/browserContext";
import { toast } from "sonner";


type ProjectBrowserProps = {
    projects: ProjectInfo[],
    contentString?: string,
    children?: {props?: {value: string}},
} & React.ComponentProps<'div'>;


export interface ProjectBrowserHandle {
    getActiveProject: () => ProjectInfo | null,
    // getOpenedProject: () => ProjectData | null,  

    getActiveIndex: () => number | null,

    setActiveProject: (id: string | ProjectInfo | null) => void,
    // setActiveProjectFromInfo: (info: ProjectItemInfo | null) => void,

    // setOpenedProjectIndex: (index: number | null) => void,

    setOpenProjectFromId: (id: string | null) => void,
}


function isEquivalentSet(s1: Set<any>, s2: Set<any>): boolean {
    return (s1.size === s2.size) && [...s1].every(x=>s2.has(x));
}

function isEquivalentFilterState(s1: FilterState, s2: FilterState, includeOpenProject: boolean = false): boolean {
    if(includeOpenProject && (s1.openProjectId !== s2.openProjectId)) return false;

    if((s1.year === undefined) || (s1.year[0] === undefined && s1.year[1] === undefined)) {
        if(!((s2.year === undefined) || (s2.year[0] === undefined && s2.year[1] === undefined)))
            return false;
    } else if(((s2.year === undefined) || (s2.year[0] === undefined && s2.year[1] === undefined)))
        return false;
    else if(s1.year[0] !== s2.year[0] || s1.year[1] !== s2.year[1])
        return false;

    if(!isEquivalentSet(s1.categories, s2.categories)) return false;

    for(const tagType of TAGTYPES) {
        const tags1 = s1.tags[tagType];
        const tags2 = s2.tags[tagType];
        if(!isEquivalentSet(tags1, tags2)) return false;
    }


    return true;
}

const ProjectBrowserInner = forwardRef<ProjectBrowserHandle, ProjectBrowserProps & {
    filterRangeInfo: FilterRangeInfo
}>(({ children, filterRangeInfo, contentString }, ref) => {
    console.log('[ProjectBrowserInner] Render start', {
        url: window.location.href,
        search: window.location.search,
    });

    // Get state from stores
    // const visibleProjects = useBrowserContext(s => Array.from(s.visibleProjects.values()));
    // const visibleProjects = useBrowserContext(
    //     s => Array.from(s.visibleProjects.values()),
    //     (a, b) => {
    //         console.log('[Equality check]', a.length, b.length, a === b);
    //         // return shallow(a,b);
    //         if (a.length !== b.length) return false;
    //         return a.every((p, i) => p.id === b[i]?.id);
    //     }
    // );
    const visibleProjects = useBrowserContext(s=>s.visibleProjects);
    // const activeProjectIndex = useBrowserContext(s => s.activeProjectIndex, doubleEq);
    // const activeProjectId = useBrowserContext(s => s.activeProjectId, doubleEq);
    // const openProjectId = useBrowserContext(s => s.openProjectId, doubleEq);
    // const carouselOpen = useBrowserContext(s => s.carouselOpen);
    // const sheetOpen = useBrowserContext(s => s.sheetOpen);
    
    // Get actions from stores
    const setActiveProjectIndex = useBrowserContext(s => s.setActiveProjectIndex);
    // const clickItem = useBrowserContext(s => s.clickItem);
    const setCarouselOpen = useBrowserContext(s => s.setCarouselOpen);
    // const onCarouselOpenChange = useBrowserContext(s=>s.onCarouselOpenChange);
    // const setSheetOpen = useBrowserContext(s => s.setSheetOpen);
    const getIndexForId = useBrowserContext(s => s.getIndexForId);

    // // useEffect(()=>{
    // console.log('[ProjectBrowserInner] State:', {
    //     visibleProjectsCount: visibleProjects.length,
    //     activeProjectIndex,
    //     activeProjectId,
    //     openProjectId,
    //     carouselOpen
    // });
    // }, []);

    // const activeProject = useMemo((): ProjectInfo | null => 
    //     activeProjectIndex !== null ? visibleProjects[activeProjectIndex] ?? null : null, 
    //     [visibleProjects, activeProjectIndex]
    // );

    const setActiveProjectFromId = React.useCallback((id: string | ProjectInfo | null) => {
        if (id === null) {
            console.warn('Setting activeProjectIndex to null');
            setActiveProjectIndex(null);
            return;
        }
        
        const id_ = (typeof id === 'string') ? id : id.id;
        const idx = getIndexForId(id_);
        
        if (idx === null) {
            console.error(`Project with id '${id_}' not found in visible projects`);
            return;
        }
        
        console.info('Setting activeProjectIndex to:', idx);
        setActiveProjectIndex(idx);
    }, []); // , [getIndexForId, setActiveProjectIndex]);

    
    const setOpenProjectFromId = React.useCallback((id: string | null) => {
        console.log('Set open project from ID:', id);
        
        if (id === null) {
            setCarouselOpen(false);
            return;
        }
        
        const idx = getIndexForId(id);
        if (idx === null) {
            console.error(`Project with id '${id}' not found in visible projects`);
            return;
        }
        
        setActiveProjectIndex(idx);
        setCarouselOpen(true);
    }, []); //}, [getIndexForId, setActiveProjectIndex, setCarouselOpen, onCarouselOpenChange]);

    // const handleRef = useRef<ProjectBrowserHandle>({
    //     getActiveProject: () => activeProject,
    //     getActiveIndex: () => activeProjectIndex,
    //     setActiveProject: setActiveProjectFromId,
    //     setOpenProjectFromId: setOpenProjectFromId
    // });

    
    // // Update ref when callbacks change
    // React.useEffect(() => {
    //     handleRef.current = {
    //         getActiveProject: () => activeProject,
    //         getActiveIndex: () => activeProjectIndex,
    //         setActiveProject: setActiveProjectFromId,
    //         setOpenProjectFromId: setOpenProjectFromId
    //     };
    // }, [activeProject, activeProjectIndex, setActiveProjectFromId, setOpenProjectFromId]);

    // useImperativeHandle(ref, () => handleRef.current, []);

  if (contentString === undefined) {
        contentString = children!.props!.value;
    }

    const _contentElements = parse(contentString);
    const contentElements = (
        (typeof _contentElements === 'string') 
            ? [<>{_contentElements}</>] 
            : Array.isArray(_contentElements) 
                ? _contentElements 
                : [_contentElements]
    ).filter((x) => typeof x === 'object');

    // console.log('[ProjectBrowserInner] Render end');

    // useInitializeFromURL(filterRangeInfo, initialized.current);


    console.log('[ProjectBrowserInner] Render end');

     return <>
        <FilterSheet 
            projects={visibleProjects} 
            rangeInfo={filterRangeInfo} 
        />
        <ProjectGrid />
        <ProjectCarouselDialog 
            contentElements={contentElements}
        />
    </>;
});

export default function ProjectBrowser({children, projects, contentString}: ProjectBrowserProps) {
    const filterRangeInfo = useMemo(() => collectFilterRangeInfo(projects), [projects]);
    
    const scrollToRef = React.useRef<ScrollToFn | undefined>(undefined);

    const showToast = React.useCallback((message: string) => {
        console.warn('[Toast]', message, 
            toast.error(message, {})
        );
        // setToastMessage(message);
        // Auto-clear toast after a few seconds
        // setTimeout(() => setToastMessage(null), 5000);
    }, []);

    const scrollTo = React.useCallback<ScrollToFn>((index: number, jump?: boolean) => {
        console.log('[ScrollTo]', index, jump);
        // Implement your scroll logic here
        // This might involve scrolling the grid to bring the item at `index` into view
        scrollToRef.current?.(index, jump);
    }, []);


    return <>
        {/* <StrictMode> */}
            <AlertToast></AlertToast>
            {/* <AlertToast message={toastMessage} onClose={() => setToastMessage(null)} /> */}
            <BrowserStoreProvider 
                allProjects={projects}
                filterRangeInfo={filterRangeInfo}
                showToast={showToast}
                scrollTo={scrollTo}
            >
                <ProjectBrowserInner 
                    filterRangeInfo={filterRangeInfo} 
                    projects={projects} 
                    contentString={contentString}
                >
                    {children}
                </ProjectBrowserInner>
            </BrowserStoreProvider>
        {/* </StrictMode> */}
    </>;
} 