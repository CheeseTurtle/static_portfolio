// src/components/ProjectGrid.tsx
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, type RefObject } from "react";
import ProjectItem, { type ProjectItemElement, type ProjectItemHandle } from "./items/ProjectItem";
import type { ProjectInfo } from "./../types";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useBrowserContext } from "../filtering/common/browserContext";
import type { ScrollToFn } from "../filtering/common/filterTypes";
import { cn } from "@/lib/utils";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import useThrottledDebounce from "@/hooks/useThrottledDebounce";

interface ProjectGridProps {
  scrollContainer: RefObject<any>,

};

export interface ProjectGridHandle {
  scrollActiveProjectIntoView: (jump?: boolean) => void,
  scrollToItem: ScrollToFn,
};

// const ProjectGrid = (({ref, scrollContainer}: PropsWithRef<ProjectGridProps,ProjectGridHandle>) => {
const ProjectGrid = React.memo(forwardRef<ProjectGridHandle, ProjectGridProps>(({scrollContainer}: ProjectGridProps, ref) => {
  const { width } = useWindowSize();

  // Get state from store
  const projects = useBrowserContext(s=>s.visibleProjects);
  const activeProjectId = useBrowserContext(s => s.activeProjectId);
  const activeProjectIndex = useBrowserContext(s => s.activeProjectIndex);
  const openProjectId = useBrowserContext(s => s.openProjectId);
  const carouselOpen = useBrowserContext(s => s.carouselOpen);
  
  // Get actions from store
  const clickItem = useBrowserContext(s => s.clickItem);

  const deferredActiveProjectId = React.useDeferredValue(activeProjectId);
  const gridActiveProjectId = React.useMemo(()=>(carouselOpen ? deferredActiveProjectId : activeProjectId), [carouselOpen, deferredActiveProjectId, activeProjectId]);


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
  
  const projectRefs = React.useRef<Record<string, React.RefObject<ProjectItemHandle>>>({});
  projectRefs.current = Object.fromEntries(projects.map(p=>[p.id, projectRefs.current[p.id] ?? React.createRef()]));

  const extraRefs = React.useRef<Record<string, React.RefObject<HTMLDivElement>>>({});
  extraRefs.current = Object.fromEntries(projects.map(p=>[p.id, extraRefs.current[p.id] ?? React.createRef()]));

  
  const projectSizeChanging = React.useRef<boolean[]>([]);
  
  const [_isPending, startTransition] = React.useTransition();

  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  
  const maxExtraHeight = Math.max(0, ...Object.values(extraRefs.current).map(x=>x.current?.scrollHeight ? Math.ceil(x.current.scrollHeight) : 0));

  const [collapsedGridHeight, setCollapsedGridHeight] = React.useState<number>(0);
  const isMeasuringRef = React.useRef(false);
  const lastNaturalHeightRef = React.useRef<number>(0);
  
  const measureBaseHeight = useCallback(() => {
    console.log('Measure base height')
    if (!gridContainerRef.current || isMeasuringRef.current) return;
    
    isMeasuringRef.current = true;
    console.log('Measuring ref current = true)')
    
    const container = gridContainerRef.current;
    const originalMinHeight = container.style.minHeight;
    
    // Temporarily remove minHeight to get true collapsed size
    container.style.minHeight = 'auto';
    
    // Force reflow and measure
    void container.offsetHeight;
    const naturalHeight = container.scrollHeight;
    
    // Restore minHeight immediately
    container.style.minHeight = originalMinHeight;
    
    // Only update state if the natural height actually changed significantly
    // startTransition(()=>{
      if (Math.abs(naturalHeight - lastNaturalHeightRef.current) > 5) {
        lastNaturalHeightRef.current = naturalHeight;
        setCollapsedGridHeight(naturalHeight);
        // Release lock after next frame
      }
    // })
    requestAnimationFrame(() => {
      console.log('Measuring ref current = false)')
      isMeasuringRef.current = false;
    });
    console.log('End measure base height')
    
  }, []);


  // Initial measurement
  React.useLayoutEffect(() => {
    console.log('Refreshing projectSizeChanging array')
    projectSizeChanging.current = new Array<boolean>(projects.length).fill(false);
    console.log('Done refreshing projectSizeChanging array')
    // measureBaseHeight();
  }, [projects, columns, measureBaseHeight]);

  const setSizeChanging = React.useCallback((index: number, changing: boolean)=>{
    if(projectSizeChanging.current[index] === changing)
      return;
    projectSizeChanging.current.splice(index, 1, changing);
    projectSizeChanging.current = Array.from(projectSizeChanging.current);
  }, []);

  // Projects in columns
  const projectCols = cols.map((col, i) =>
    col.map((p, index): ProjectItemElement => {
        const refIndex = columns * i + index;

        // Calculate the actual index in the full projects array
        const projectIndex = projects.findIndex(proj => proj.id === p.id);
        return (
          <ProjectItem 
            ref={projectRefs.current[p.id]}
            extraRef={extraRefs.current[p.id]}
            key={p.id}
            project={p}
            refIndex={refIndex}
            projectIndex={projectIndex}
            activeProjectId={gridActiveProjectId}
            openProjectId={openProjectId}
            carouselOpen={carouselOpen}
            clickItem={clickItem}
            scrollContainer={scrollContainer}
            setSizeChanging={setSizeChanging}
          />
        );
    }));

  
  const projectItems = useMemo(()=>projectCols.flat(1), [projectCols]);

  const projectGridContents = useMemo(()=>projectCols.map((colElems, i) => (
    <div key={i} className="flex-1 flex flex-col gap-4 h-min max-w-[calc(100vw-16*var(--spacing))]">
      {colElems}
    </div>
  )), [projectCols]);

  const activeProjectItem = useMemo(()=>activeProjectIndex === null ? null : 
    // projectItems.find(x=>x.key === activeProjectId) ?? null,
    projectCols[activeProjectIndex % columns][Math.floor(activeProjectIndex / columns)], 
    [activeProjectIndex, columns, projectCols]);
  
  const activeProjectRef = useMemo(()=>activeProjectItem ? projectRefs.current?.[activeProjectItem.props.refIndex] ?? null : null, [activeProjectItem, projectRefs]);

  const scrollActiveProjectIntoView = useCallback((jump?: boolean)=> {
    // console.log('SCROLL ACTIVE INTO VIEW:', activeProjectRef?.current, jump);
    activeProjectRef?.current?.scrollIntoView(jump);
  }, [activeProjectRef]);

  const scrollToItem: ScrollToFn = useCallback((index, jump)=>{
    const item = projectItems.find(p=>p.props.projectIndex === index);
    // console.log('SCROLL TO ITEM:', index, item, jump);
    if(!item) return;
    const itemRef = projectRefs.current?.[item.props.project.id];
    itemRef?.current?.scrollIntoView(jump);
  }, [projectItems]);

  useImperativeHandle(ref, () => ({
    scrollActiveProjectIntoView, scrollToItem
  }), [scrollActiveProjectIntoView, scrollToItem]);


  
  
  const [anySizeChanging, setAnySizeChanging] = React.useState<boolean>(false);
  const handle = React.useRef<ReturnType<typeof requestAnimationFrame> | undefined>(undefined);


  const updateSizeChanging = React.useCallback((sizeChangingCurrent: boolean[]) => {
    console.log('Update size changing')
    const value = sizeChangingCurrent.some(x=>x);
    if(handle.current !== undefined) {
      cancelAnimationFrame(handle.current);
      handle.current = undefined;
    }
    if(value) setAnySizeChanging(true);
    else handle.current = requestAnimationFrame(()=>setAnySizeChanging(false));

    console.log('End update size changing')

    return ()=>{
      if(handle.current !== undefined) {
        cancelAnimationFrame(handle.current);
        handle.current = undefined;
      }
    }


  }, []);
  // const updateSizeChangingDebounced = useThrottledDebounce(updateSizeChanging, 500, 250);

  const sizeChangingCurrent = projectSizeChanging.current;
  // React.useEffect(()=>{
  //   updateSizeChangingDebounced(sizeChangingCurrent);
  //   return () =>{
  //     updateSizeChangingDebounced.flush();
  //   }
  // }, [updateSizeChangingDebounced, sizeChangingCurrent])


  React.useEffect(()=>{
    // startTransition(async () => {
      // await new Promise<void>((resolve)=>{
        updateSizeChanging(sizeChangingCurrent);
        // resolve();
      // });
    // });
  }, [updateSizeChanging, sizeChangingCurrent])


  // Track resize changes
  // TODO: Temporarily disable resize observation during carousel update
  useResizeObserver({
    ref: gridContainerRef,
    onResize: ()=>{
        if (!isMeasuringRef.current) {
          measureBaseHeight()
        }
    },
    enabled: !anySizeChanging,
    throttle: 200,  // Update at most every 200ms during resize
    debounce: 150,  // Final update 150ms after resize stops
  });

  const totalReservedHeight = React.useMemo(()=>collapsedGridHeight + maxExtraHeight, [collapsedGridHeight, maxExtraHeight]);

  return (
      <div
        className="grid w-full overflow-y-visible"
        style={{
          gridTemplateRows: `auto minmax(0, ${maxExtraHeight}px)`,
          minHeight: collapsedGridHeight > 0 ? `max(100vh, ${totalReservedHeight}px)` : '100vh',
        }}
      >
        <div ref={gridContainerRef} className={cn("w-full max-w-full grid grid-flow-col auto-cols-fr gap-4 p-8 pt-4 h-min overflow-y-visible sm:grid-flow-col-dense md:grid-flow-col-dense")}> 
          {projectGridContents}
        </div>
        <div 
          id="project-grid-expansion-reserve" 
          className="pointer-events-none"
          aria-hidden="true"
        />
      </div>
  );
}));

export default ProjectGrid;