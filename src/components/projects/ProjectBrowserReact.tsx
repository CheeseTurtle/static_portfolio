import React, { forwardRef, StrictMode, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react"
import ProjectGrid from "./grid/ProjectGrid";
// import ProjectCarousel from "./overlay/ProjectCarousel";
import ProjectCarouselDialog from "./overlay/ProjectCarouselDialog";
import type { ProjectData } from "./types";
import FilterSheet, { type FilterSpec } from "./filtering/FilterSheet";
import parse from "html-react-parser";

type ProjectBrowserProps = {
    projects: ProjectData[],
    contentString?: string,
    children?: {props?: {value: string}},
} & React.ComponentProps<'div'>;


export interface ProjectBrowserHandle {
    getActiveProject: () => ProjectData | null,
    // getOpenedProject: () => ProjectData | null,  

    getActiveIndex: () => number | null,

    setActiveProject: (id: string | ProjectData | null) => void,
    // setActiveProjectFromInfo: (info: ProjectItemInfo | null) => void,

    // setOpenedProjectIndex: (index: number | null) => void,
}



const ProjectBrowser = forwardRef<ProjectBrowserHandle, ProjectBrowserProps>(({children, projects, contentString}: ProjectBrowserProps, ref) => {
    // const [openedProject, setOpenedProjectItem] = useState<ProjectItemInfo | null>(null);
    // const [hoveredProject, setHoveredProjectItem] = useState<ProjectItemInfo | null>(null);


    const projectRecord: Record<string, ProjectData> = Object.fromEntries(
        projects.map((p) => [p.id, p])
    );

    // const [visibleProjects, setVisibleProjects] = useState<ProjectData[]>(projects);
    const [carouselOpen, setCarouselOpen] = useState<boolean>(false);
    const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
    const [openedProjectId, setOpenedProjectId] = useState<string | null>(null);
    const [filterSheetOpen, setFilterSheetOpen] = useState<boolean>(false);
    const [filterSpec, setFilterSpec] = useState<FilterSpec>({});


    const visibleProjects = useMemo(() => {
        const ret = projects.filter((p)=>{
            if(filterSpec.minYear !== undefined && filterSpec.minYear > p.year) return false;
            if(filterSpec.maxYear !== undefined && filterSpec.maxYear < p.year) return false;
            if(filterSpec.category !== undefined && filterSpec.category !== p.category) return false;
            if(filterSpec.lang !== undefined && filterSpec.lang.length > 0 && -1 < filterSpec.lang.findIndex(x=>!p.tags.languages?.includes(x))) return false;
            if(filterSpec.skill !== undefined && filterSpec.skill.length > 0 && -1 < filterSpec.skill.findIndex(x=>!p.tags.skills?.includes(x))) return false;
            if(filterSpec.topic !== undefined && filterSpec.topic.length > 0 && -1 < filterSpec.topic.findIndex(x=>!p.tags.topics?.includes(x))) return false;
            return true;
        });
        console.log('Setting visible projects:', ret);
        return ret;
    }, [filterSpec, projects])

    const activeProject = useMemo((): ProjectData | null => (null === activeProjectIndex ? null : visibleProjects[activeProjectIndex]), [visibleProjects, activeProjectIndex]);

    const activeProjectId = useMemo((): string | undefined => {
        // console.log('activeProject:', activeProject, activeProject?.id);
        return activeProject?.id
    }, [activeProject, visibleProjects, activeProjectIndex]);

    const setActiveProject = useCallback((id: string | ProjectData | null) => {
            if (null === id) {
                // console.warn('Setting activeProjectIndex to null')
                setActiveProjectIndex(null);
                setOpenedProjectId(null);
                return;
            } 
            const id_ = (typeof id === 'string') ? id : id.id;
            const data = (typeof id === 'string') ? projectRecord[id] : id;

            const idx = visibleProjects.findIndex((x)=>id_ == x.id);
            // console.log('Found at index:', idx, visibleProjects[idx], id_)
            if(idx === -1) {
                throw RangeError();
            } else {
                // console.info('Setting activeProjectIndex to:', idx, 'prev:', activeProjectIndex)
                setActiveProjectIndex(idx);
                if(carouselOpen) setOpenedProjectId(id_);
            }
            // console.log('Setted activeProjectIndex to:', activeProjectIndex)
        }, [visibleProjects, openedProjectId, carouselOpen, activeProjectIndex]);

    const handleRef = useRef<ProjectBrowserHandle>({
        getActiveProject: useCallback(() => activeProject, [activeProject]),

        getActiveIndex: useCallback(() => activeProjectIndex, [activeProjectIndex]),
        // getOpenedProject: useCallback(() => openedProject, [openedProject]),

        // setOpenedProjectIndex: (index: number | null) => {
        //     setActiveProjectIndex(index);

        // },

        setActiveProject,

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

    return <>
        <StrictMode>
            <FilterSheet open={filterSheetOpen} setOpen={setFilterSheetOpen} filterSpec={filterSpec} setFilterSpec={setFilterSpec} allProjects={projects}></FilterSheet>
            <ProjectGrid projects={visibleProjects} openedProjectId={openedProjectId} setOpenedProjectId={setOpenedProjectId} activeProject={activeProject} activeProjectIndex={activeProjectIndex} activeProjectId={activeProjectId} setActiveProjectItem={(item) => handleRef.current!.setActiveProject(item)} setCarouselOpen={setCarouselOpen} carouselOpen={carouselOpen}></ProjectGrid>
            {/* <ProjectDialog open={carouselOpen} setOpen={setCarouselOpen} onOpenChange={() => handleRef.current!.setActiveProject(null)}></ProjectDialog> */}
            <ProjectCarouselDialog openedProjectId={openedProjectId} setOpenedProjectId={setOpenedProjectId} open={carouselOpen} setOpen={setCarouselOpen} projects={visibleProjects} activeProjectIndex={activeProjectIndex} setActiveProjectIndex={setActiveProjectIndex} contentElements={contentElements}></ProjectCarouselDialog>
        </StrictMode>
    </>
})

export default ProjectBrowser;