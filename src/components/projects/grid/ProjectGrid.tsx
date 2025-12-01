// src/components/ProjectGrid.tsx
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, type RefObject } from "react";
import ProjectItem, { type ProjectItemElement, type ProjectItemHandle } from "./items/ProjectItem";
import type { ProjectInfo } from "./../types";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useBrowserContext } from "../filtering/common/browserContext";
import type { ScrollToFn } from "../filtering/common/filterTypes";
import { cn } from "@/lib/utils";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { CaptionedLightboxProvider } from "../CaptionedLightbox";

interface ProjectGridProps {
  scrollContainer: RefObject<any>,

};

export interface ProjectGridHandle {
  scrollActiveProjectIntoView: (jump?: boolean) => void,
  scrollToItem: ScrollToFn,
};

// const ProjectGrid = (({ref, scrollContainer}: PropsWithRef<ProjectGridProps,ProjectGridHandle>) => {
const ProjectGrid = forwardRef<ProjectGridHandle, ProjectGridProps>(({scrollContainer}: ProjectGridProps, ref) => {
  const { width } = useWindowSize();

  // Get state from store
  // const projects = useBrowserContext(s => Array.from(s.visibleProjects.values()));
  const projects = useBrowserContext(s=>s.visibleProjects);
  const activeProjectId = useBrowserContext(s => s.activeProjectId);
  const activeProjectIndex = useBrowserContext(s => s.activeProjectIndex);
  const openProjectId = useBrowserContext(s => s.openProjectId);
  const carouselOpen = useBrowserContext(s => s.carouselOpen);
  
  // const activeProjectId = useDeferredValue(activeProjectId_);
  // const activeProjectIndex = useDeferredValue(activeProjectIndex_);

  // Get actions from store
  const clickItem = useBrowserContext(s => s.clickItem);
  const setCarouselOpen = useBrowserContext(s => s.setCarouselOpen);

  const activeProject = useMemo(
    () => activeProjectIndex !== null ? projects[activeProjectIndex] ?? null : null,
    [projects, activeProjectIndex]
  );


  // Determine number of columns based on viewport width
  const columns = useMemo(() => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1400) return 3;
    return 4;
  }, [width]);

  // Split projects row-wise into columns
  const cols: ProjectInfo[][] = useMemo(() => {
    // console.log('Projects:', projects.map(x=>[x.id, x.date]))
    const arr: ProjectInfo[][] = Array.from({ length: columns }, () => []);
    projects.forEach((p, i) => {
      arr[i % columns].push(p);
    });
    // console.log(arr.map(a=>a.map(x=>[x.id,x.date])))
    return arr;
  }, [projects, columns]);
  
  // const maxExtraHeight = React.useRef<number>(0);
  
  const projectRefs = React.useRef<React.RefObject<ProjectItemHandle>[]>([]);
  projectRefs.current = projects.map((_, i) => projectRefs.current[i] ?? React.createRef());
  

  const extraRefs = React.useRef<React.RefObject<HTMLDivElement>[]>([]);
  extraRefs.current = projects.map((_, i) => extraRefs.current[i] ?? React.createRef());



  // Projects in columns
  const projectCols = cols.map((col, i) =>
    col.map((p, index): ProjectItemElement => {
        const refIndex = columns * i + index;

        // Calculate the actual index in the full projects array
        const projectIndex = projects.findIndex(proj => proj.id === p.id);
        return (
          <ProjectItem 
            ref={projectRefs.current[refIndex]}
            extraRef={extraRefs.current[refIndex]}
            key={p.id}
            project={p}
            refIndex={refIndex}
            projectIndex={projectIndex}
            activeProject={activeProject}
            activeProjectId={activeProjectId}
            activeProjectIndex={activeProjectIndex}
            openProjectId={openProjectId}
            carouselOpen={carouselOpen}
            clickItem={clickItem}
            setCarouselOpen={setCarouselOpen}
            scrollContainer={scrollContainer}
          />
        );
    }));

  
  const projectItems = useMemo(()=>projectCols.flat(1), [projectCols]);

  const activeProjectItem = useMemo(()=>activeProjectIndex === null ? null : 
    // projectItems.find(x=>x.key === activeProjectId) ?? null,
    projectCols[activeProjectIndex % columns][Math.floor(activeProjectIndex / columns)], 
    [activeProjectIndex, columns, projectCols]);
  
  // const activeProjectRef = useMemo(()=>activeProjectItem?.props.ref ?? null as React.Ref<ProjectItemHandle> | null, [activeProjectItem]);
  const activeProjectRef = useMemo(()=>activeProjectItem ? projectRefs.current?.[activeProjectItem.props.refIndex] ?? null : null, [activeProjectItem, projectRefs]);
  
  // console.log('activeProjectItem:', activeProjectItem, activeProjectRef);

  const scrollActiveProjectIntoView = useCallback((jump?: boolean)=> {
    // if(!activeProjectRef) return;
    // const activeRef = projectRefs.current?.find(x=>x==activeProjectRef);
    // const ref = projectRefs.current?.[2];
    activeProjectRef?.current?.scrollIntoView(jump);
  }, [activeProjectRef]);

  const scrollToItem: ScrollToFn = useCallback((index, jump)=>{
    const item = projectItems.find(p=>p.props.projectIndex === index);
    if(!item) return;
    const itemRef = projectRefs.current?.[item.props.refIndex];
    if(!itemRef) return;
    itemRef?.current?.scrollIntoView(jump);
  }, [projectItems]);

  useImperativeHandle(ref, () => ({
    scrollActiveProjectIntoView, scrollToItem
  }), [scrollActiveProjectIntoView, scrollToItem]);


  const maxExtraHeight = Math.max(0, ...extraRefs.current.map(x=>Math.ceil(x.current?.scrollHeight ?? 0)));
  // const extraClassName = React.useMemo(()=>maxExtraHeight ? `mb-[${maxExtraHeight}px]`: undefined, [maxExtraHeight]);
  // const extraHeightDiv = React.useMemo(()=><div id="project-grid-bottom-padding" className="flex, border-none outline-none bg-none pointer-events-none w-full" style={{flexGrow: 1, minHeight: 0, flexBasis: `${maxExtraHeight ?? 0}px`, maxHeight: `${maxExtraHeight ?? 0}px`}}></div>, [maxExtraHeight]);

  // console.log(maxExtraHeight, extraClassName);

  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  const [baseHeight, setBaseHeight] = React.useState<number>(0);

  // Calculate base height by subtracting any expanded content
  const measureBaseHeight = useCallback(() => {
    if (!gridContainerRef.current) return;
    
    const currentHeight = gridContainerRef.current.scrollHeight;
    
    // Subtract the height of any currently expanded extra content
    const expandedExtraHeight = extraRefs.current.reduce((sum, ref) => {
      return sum + (ref.current?.clientHeight ?? 0);
    }, 0);
    
    const calculatedBaseHeight = currentHeight - expandedExtraHeight;
    setBaseHeight(calculatedBaseHeight);
  }, []);

  // Initial measurement
  React.useLayoutEffect(() => {
    measureBaseHeight();
  }, [projects, columns, measureBaseHeight]);

  // Track resize changes
  useResizeObserver({
    ref: gridContainerRef,
    onResize: measureBaseHeight,
    // throttle: 200,  // Update at most every 200ms during resize
    // debounce: 150,  // Final update 150ms after resize stops
  });

  return (
    <CaptionedLightboxProvider>
      <div
        className="grid w-full overflow-y-visible"
        style={{
          gridTemplateRows: `auto minmax(0, ${maxExtraHeight}px)`,
          minHeight: baseHeight > 0 ? `max(100vh, ${baseHeight + maxExtraHeight}px)` : '100vh',
        }}
      >
        <div ref={gridContainerRef} className={cn("flex w-full gap-4 p-8 pt-4 h-min overflow-y-visible")}> 
          {/* style={{scrollMarginBottom: maxExtraHeight}}> */}
          {projectCols.map((colElems, i) => (
            <div key={i} className="flex-1 flex flex-col gap-4">
              {colElems}
              {/* {colElems.map((p, index) => {
                // Calculate the actual index in the full projects array
                const projectIndex = projects.findIndex(proj => proj.id === p.id);
                return (
                  <ProjectItem 
                    key={p.id}
                    project={p}
                    projectIndex={projectIndex}
                    activeProject={activeProject}
                    activeProjectId={activeProjectId}
                    activeProjectIndex={activeProjectIndex}
                    openProjectId={openProjectId}
                    carouselOpen={carouselOpen}
                    clickItem={clickItem}
                    setCarouselOpen={setCarouselOpen}
                  />
                );
              })} */}
            </div>
          ))}
        </div>
        {/* {extraHeightDiv} */}
        <div 
          id="project-grid-expansion-reserve" 
          className="pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </CaptionedLightboxProvider>
  );
});

export default ProjectGrid;