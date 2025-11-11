import React, { forwardRef, StrictMode, useCallback, useEffect, useEffectEvent, useImperativeHandle, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react"
import ProjectGrid from "./grid/ProjectGrid";
// import ProjectCarousel from "./overlay/ProjectCarousel";
import ProjectCarouselDialog from "./overlay/ProjectCarouselDialog";
import type { ProjectInfo, TagKey } from "./types";
import FilterSheet, { type FilterSpec } from "./filtering/FilterSheet";
import parse from "html-react-parser";
import { FilterProvider, useFilter } from "./filtering/common/filterContext";
import { collectFilterRangeInfo, getProjectKeyFromTagType, TAGTYPES, type FilterRangeInfo, type FilterState, type TagType } from "./filtering/common/filterTypes";
import { FilterURLSync, useInitializeFilterFromURL } from "./filtering/sync";

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

const ProjectBrowserInner = forwardRef<ProjectBrowserHandle, ProjectBrowserProps & {filterRangeInfo: FilterRangeInfo, carouselOpen: boolean, setCarouselOpen: Dispatch<SetStateAction<boolean>>}>(({children, filterRangeInfo, projects, contentString, carouselOpen, setCarouselOpen}: ProjectBrowserProps & {filterRangeInfo: FilterRangeInfo, carouselOpen: boolean, setCarouselOpen: Dispatch<SetStateAction<boolean>>}, ref) => {
    const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
    const [openedProjectId, setOpenedProjectId] = useState<string | null>(null);
    const [filterSheetOpen, setFilterSheetOpen] = useState<boolean>(false);
    const [storedFilterSheetOpen, setStoredFilterSheetOpen] = useState<boolean>(false);
    const {state, dispatch} = useFilter();

    const [storedFilterState, setStoredFilterState] = useState<FilterState>(state);
    const [storedOpenedId, setStoredOpenedId] = useState<string|null>(null);

    const visibleProjects = useMemo(()=>projects.filter((p)=>{
        // console.log('Project:', p);
        const stateYear = state.year;
        if((stateYear !== undefined) && ((stateYear[0] !== undefined && stateYear[0] > p.date.getFullYear()) || (stateYear[1] !== undefined && stateYear[1] < p.date.getFullYear()))) return false;
        if(state.categories.size > 0 && !state.categories.has(p.category)) return false;
        for(const [tagType, tags] of Object.entries(state.tags)) {
            const tagKey: TagKey = getProjectKeyFromTagType(tagType as TagType);
            if(tags.size === 0) continue;
            for(const tagText of tags.values()) {
                if(!p.tags[tagKey].has(tagText)) return false;
            }
        }
        // console.log('Project passes:', p);
        return true;
    }), [projects, state]);

    const activeProject = useMemo((): ProjectInfo | null => (null === activeProjectIndex ? null : visibleProjects[activeProjectIndex]), [visibleProjects, activeProjectIndex]);

    const activeProjectId = useMemo((): string | undefined => {
        // console.log('Getting activeProject ID:', activeProject, activeProject?.id);
        return activeProject?.id
    }, [activeProject]);


    
    const handleActiveIdChange = useEffectEvent((id: string | undefined | null) => {
        console.log('Active ID changed:', id, carouselOpen);
        if(carouselOpen) { setOpenedProjectId(id ?? null); }
    });

    useEffect(()=>{
        handleActiveIdChange(activeProjectId);
    }, [activeProjectId, handleActiveIdChange]);

    const handleSheetOpenChange = useEffectEvent((sheetOpen: boolean) => {
        if(sheetOpen === storedFilterSheetOpen) return;
        console.log('sheetOpen changed:', sheetOpen, storedFilterSheetOpen);
        try {
            if(sheetOpen) { // Sheet has been opened
                setStoredFilterState(state);
                return;
            }

            // Sheet has been closed, or changes made with closed sheet (i.e. reset/clear)
            if(isEquivalentFilterState(state, storedFilterState)) return; // No change. (Handle updating based on open project ID elsewhere.)

            // TODO: Update URL and push history
            console.info('Updating URL (filter) and pushing history')
            setStoredFilterState(state);
        } finally {
            setStoredFilterSheetOpen(sheetOpen);
        }
    });

    useEffect(() => {
        handleSheetOpenChange(filterSheetOpen);
    }, [filterSheetOpen]);



    const handleCarouselOpenChange   = useEffectEvent((carouselOpen: boolean) => {
        const activeId = activeProjectId;
        console.log('carouselOpen changed in root:', carouselOpen, activeProjectIndex, activeProjectId, activeId, openedProjectId, storedOpenedId);
        if(carouselOpen) {
            if(!openedProjectId && activeProjectId) {
                console.log('Setting opened project ID:', activeProjectId, storedOpenedId);
                setOpenedProjectId(activeProjectId);
            }
        } else if(openedProjectId) {
            console.log('Clearing opened project ID:', openedProjectId, storedOpenedId);
            setOpenedProjectId(null);
        }
    }); //, [activeProjectIndex, activeProjectId, openedProjectId, storedOpenedId]);


    // const handleCarouselOpenChange = useEffectEvent((carouselOpen: boolean) => handleCarouselOpenChange_(carouselOpen));

    useEffect(() => {
        handleCarouselOpenChange(carouselOpen);
    }, [carouselOpen]);

    const handleOpenedProjectIdChange = useEffectEvent((openedProjectId: string | null) => {
        // const storedOpenedId = storedFilterState.openProjectId;
        if(openedProjectId === storedOpenedId) return;
        console.log(`openedProjectId changed (carouselOpen: ${carouselOpen}):`, openedProjectId, storedOpenedId)
        if(carouselOpen) { // Carousel has either just been opened, or next/prev buttons were used.
            if(storedOpenedId === null) { // Carousel just opened
                if(openedProjectId === null) return;
                console.info('Updating URL and pushing history')
                // TODO: Update URL and push history 
            } else if(openedProjectId === null) {
                // setStoredOpenedId(openedProjectId);
                console.error(`openedProjectId is unexpectedly undefined even though the carousel is open`, {cause: [state, storedFilterState, openedProjectId, storedOpenedId]});
            } else if(openedProjectId !== storedOpenedId) {
                console.info('Updating URL and replacing history')
                // TODO: Update URL and replace history
            }
        } else if(openedProjectId !== null) {
            // setStoredOpenedId(openedProjectId);
            console.info('Updating URL and pushing history')
            
            // console.error(`openedProjectId is unexpectedly not undefined even though the carousel is not open`, {cause: [state, storedFilterState, openedProjectId, storedOpenedId]});
        } else if(storedOpenedId === null)
            return; // This should not happen
        else {
            console.info('Updating URL and pushing history')
            // TODO: Update URL and push history
        }

        setStoredOpenedId(openedProjectId);
    });

    useEffect(() => {
        handleOpenedProjectIdChange(openedProjectId);
    }, [openedProjectId, setStoredOpenedId]);


    // const updateOpenProjectIdInURL = useCallback(() => {



    // }, []);

    const setActiveProjectFromId = useCallback((id: string | ProjectInfo | null) => {
        if (null === id) {
            // console.warn('Setting activeProjectIndex to null')
            setActiveProjectIndex(null);
            // setOpenedProjectId(null);
            return;
        } 
        const id_ = (typeof id === 'string') ? id : id.id;
        // const data = (typeof id === 'string') ? projectRecord[id] : id;

        const idx = visibleProjects.findIndex((x)=>id_ == x.id);
        // console.log('Found at index:', idx, visibleProjects[idx], id_)
        if(idx === -1) {
            throw RangeError();
        } else {
            // console.info('Setting activeProjectIndex to:', idx, 'prev:', activeProjectIndex)
            setActiveProjectIndex(idx);
            // if(carouselOpen) setOpenedProjectId(id_);
        }
        // console.log('Setted activeProjectIndex to:', activeProjectIndex)
    }, [visibleProjects, carouselOpen, activeProjectIndex, setActiveProjectIndex]);


    const handleRef = useRef<ProjectBrowserHandle>({
        getActiveProject: useCallback(() => activeProject, [activeProject]),
        getActiveIndex: useCallback(() => activeProjectIndex, [activeProjectIndex]),
        // getOpenedProject: useCallback(() => openedProject, [openedProject]),

        // setOpenedProjectIndex: (index: number | null) => {
        //     setActiveProjectIndex(index);

        // },

        setActiveProject: setActiveProjectFromId,

        // setActiveProjectFromInfo: (info: ProjectItemInfo | null) => {
        //     if(null === info) {
        //         setActiveProjectIndex(null);
        //         // handleRef.current.setOpenedProjectIndex(null);
        //     } else {
        //         const idx = visibleProjects.findIndex((x)=>info.data.id === x.id);
        //         if(idx === -1) {
        //             throw RangeError();
        //         } else {
        //             setActiveProjectIndex(idx);
        //         }
        //     }
        // }
    });

    
    useImperativeHandle(ref, () => handleRef.current, []);
    
    if(contentString === undefined)
        contentString = children!.props!.value;
    // console.log(contentString);


    // contentString.split(/a/)

    const _contentElements = parse(contentString);
    const contentElements = ((typeof _contentElements === 'string') ? [<>{_contentElements}</>] : Array.isArray(_contentElements) ? _contentElements : [_contentElements]).filter((x)=>typeof x === 'object');
    // console.log(contentElements);


    // useInitializeFilterFromURL(filterRangeInfo);


    return <>
        <FilterSheet projects={visibleProjects} rangeInfo={filterRangeInfo} open={filterSheetOpen} setOpen={setFilterSheetOpen}></FilterSheet>
        <ProjectGrid projects={visibleProjects} openedProjectId={openedProjectId} setOpenedProjectId={setOpenedProjectId} activeProject={activeProject} activeProjectIndex={activeProjectIndex} activeProjectId={activeProjectId} 
            // setActiveProjectItem={(item) => handleRef.current!.setActiveProject(item)} 
            setActiveProjectItem={setActiveProjectFromId}
            setCarouselOpen={setCarouselOpen} carouselOpen={carouselOpen}></ProjectGrid>
        <ProjectCarouselDialog startIndex={activeProjectIndex ?? undefined} activeProjectId={activeProjectId} openedProjectId={openedProjectId} setOpenedProjectId={setOpenedProjectId} open={carouselOpen} setOpen={setCarouselOpen} projects={visibleProjects} activeProjectIndex={activeProjectIndex} setActiveProjectIndex={setActiveProjectIndex} contentElements={contentElements}></ProjectCarouselDialog>
        {/* <FilterURLSync rangeInfo={filterRangeInfo} /> */}
    </>;
});

export default function ProjectBrowser({children, projects, contentString}: ProjectBrowserProps) {
    const filterRangeInfo = useMemo(() => collectFilterRangeInfo(projects), [projects]);
    const [carouselOpen, setCarouselOpen] = useState<boolean>(false);
    // const projectRecord: Record<string, ProjectInfo> = Object.fromEntries(
    //     projects.map((p) => [p.id, p])
    // );

    return <>
        <StrictMode>
            <FilterProvider rangeInfo={filterRangeInfo} carouselOpen={carouselOpen} setCarouselOpen={setCarouselOpen}>
                <ProjectBrowserInner filterRangeInfo={filterRangeInfo} projects={projects} contentString={contentString}  carouselOpen={carouselOpen} setCarouselOpen={setCarouselOpen}>
                    {children}
                </ProjectBrowserInner>
            </FilterProvider>
        </StrictMode>
    </>;
} 