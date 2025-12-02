import React, { forwardRef, StrictMode, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type RefObject } from "react"
import ProjectGrid, { type ProjectGridHandle } from "./grid/ProjectGrid";
// import ProjectCarousel from "./overlay/ProjectCarousel";
import ProjectCarouselDialog from "./overlay/ProjectCarouselDialog";
import type { ProjectInfo } from "./types";
import parse from "html-react-parser";
// import { FilterProvider, useFilter } from "./filtering/common/filterContext";
import { collectFilterRangeInfo, TAGKEYS, TAGTYPES, type FilterRangeInfo, type FilterState, type ScrollToFn, type ShowToastFn } from "./filtering/common/filterTypes";
// import { FilterURLSync, parseURL, ProjectURLSync, useInitializeFilterFromURL, useInitializeFromURL } from "./filtering/sync";
import AlertToast from "./toasts";

import { BrowserStoreProvider, useBrowserContext, useFilterStore } from "./filtering/common/browserContext";
import { toast } from "sonner";
import FilterForm from "./filtering/FilterForm";
import {useScrollSentinel, useValueChangeWatcher} from "./scrolling";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountStoreProvider, useCountContext } from "./filtering/common/stores/countStoreContext";
import ErrorBoundary from "@/hooks/ErrorBoundary";
import { useDomReady } from "@/hooks/use-dom-ready";
import type { FilterStoreState } from "./filtering/common/stores/filterStore";


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

export function isEquivalentFilterState(s1: FilterState, s2: FilterState, includeOpenProject: boolean = false): boolean {
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

function anyFilter(){
    const params = new URLSearchParams(window.location.search);
    if(!params.size) return false;
    return ['year','category',...TAGTYPES].some((k)=>params.has(k));
}

const ProjectBrowserInner = forwardRef<ProjectBrowserHandle, ProjectBrowserProps & {
    filterRangeInfo: FilterRangeInfo, scrollToRef: RefObject<ScrollToFn | undefined>, scrollTo: ScrollToFn, scrollContainer: RefObject<any>,
    showToast: ShowToastFn,

}>(({ children, projects, filterRangeInfo, contentString, showToast, scrollToRef, scrollTo, scrollContainer }, _ref) => {
    console.log('[ProjectBrowserInner] Render start', {
        url: window.location.href,
        search: window.location.search,
    });

    // Get state from stores
    const visibleProjects = useBrowserContext(s=>s.visibleProjects);
    const clearActiveItem = useBrowserContext(s=>s.clearActiveItem);

    
    const formRef = useRef<HTMLDivElement>(null);
    const gridHandle = useRef<ProjectGridHandle>(null);
    const filterResultsRef = useRef<HTMLDivElement>(null);

    // const {current} = useAutoScroll(true, [], {});
    // const [scrollState, scrollToFn] = useWindowScroll();




    useEffect(()=>{
        const handler = (evt: MouseEvent) => {
            if(evt.defaultPrevented) return;
            // const atTarget = evt.eventPhase === evt.AT_TARGET; // Otherwise BUBBLING_PHASE
            if(evt.target && evt.target instanceof Node) {
                if(evt.target instanceof HTMLDivElement && evt.target.id === "carousel-dialog-overlay")
                    return;
                if(!(filterResultsRef.current?.contains(evt.target) || formRef.current?.contains(evt.target)))
                    return;
            }
            console.log(evt, evt.eventPhase);
            // srcElement, explicitOriginalTarget, view
            // console.log('Window click:', evt.target, evt.currentTarget, evt.relatedTarget, evt.bubbles, evt.eventPhase, evt.defaultPrevented, evt.detail);
            clearActiveItem();
        };
        
        // document.addEventListener(type, listener)
        const opts: AddEventListenerOptions = {
            capture: false
        };
        document.addEventListener('click', handler, opts);

        return () => document.removeEventListener('click', handler, opts);
    }, [clearActiveItem]);

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

    // Keep a registry of reset callbacks for each TagButtons
    const registeredResets = useRef<Set<() => void>>(new Set());

    const registerReset = useCallback((resetFn: () => void) => {
        registeredResets.current.add(resetFn);
        return () => {registeredResets.current.delete(resetFn);} // cleanup
    }, []);

    
    // This is the shared reset function all TagButtons can call
    const resetAll = useEffectEvent(() => {
        // We'll notify children via a callback they register
        registeredResets.current.forEach((fn) => fn());
    });


    
    // const {inView, sentinelRef} = useScrollSentinel(null, 0, true, '-15% 0px 0px 0px');

    // // const sheetContentRef = useRef<HTMLDivElement>(null);
    // // const sheetTriggerRef = useRef<HTMLButtonElement>(null);
    // const onInViewChange = useCallback((value: boolean, prev: boolean)=> {
        //     console.log('In view change:', prev, value);
        // }, []);
        
        // useValueChangeWatcher<boolean, boolean>(inView, onInViewChange, {});
        
    useEffect(()=>{
        scrollToRef.current = gridHandle.current?.scrollToItem;
        // console.log(gridRef, scrollToRef);
    });

    const initiallyHasFilter = useMemo(()=>anyFilter(), []);
    const [filterExpanded, setFilterExpanded] = useState<boolean>(initiallyHasFilter);
    const [domReady, setDomReady] = useState<boolean>(false);
    useDomReady(()=>{
        setDomReady(true);
    });
    
    
    const _updateCounts = useCountContext(s=>s._updateCounts);
    const updateCounts = useEffectEvent((filterState: FilterStoreState)=>{
        _updateCounts(visibleProjects, filterState.tagModes, filterState);
    });
    const countsUpdated = useRef<boolean>(false);
    const filterStore = useFilterStore();
    // const initiallyVisibleProjects = useMemo(()=>visibleProjects, []);
    // const allProjects = useBrowserContext(s=>s.allProjects);
    useEffect(()=>{
        if(domReady && initiallyHasFilter && !countsUpdated.current) {
            // useBrowserContext(s=>s._refilterProjects)
            console.log('UPDATING COUNTS');
            const filterState = filterStore.getState();
            // updateCounts(initiallyVisibleProjects, filterState.tagModes, filterState);
            updateCounts(filterState);
            countsUpdated.current = true;
        }
    }, [initiallyHasFilter, domReady, filterStore]);


    // throw Error('help');
    return <>
        {/* <FilterSheet 
            contentRef={sheetContentRef}
            triggerRef={sheetTriggerRef}
            projects={visibleProjects} 
            rangeInfo={filterRangeInfo} 
            registerReset={registerReset}
            resetAll={resetAll}
            registeredResets={registeredResets}
            // browserStore={store}
            /> */}
            <h1 className="text-3xl font-black align-middle self-center justify-self-center justify-center text-center w-full xl:p-10 md:p-2 sm:p-1 p-0">Projects</h1>
            <Collapsible open={filterExpanded} onOpenChange={setFilterExpanded} ref={formRef} asChild>
                <div className="flex-col flex max-w-2xl min-w-xl mx-auto  bg-linear-to-tr from-gray-900 to-gray-800 rounded-lg p-0"> 
                    {/* xl:mx-30 lg:mx-20 md:mx-10 sm:mx-5 mx-2 */}
                    <CollapsibleTrigger asChild>
                        <div className="text-popover-foreground text-lg font-bold justify-center w-full items-center content-center align-middle text-center p-10 select-none cursor-pointer relative">
                            <div role="heading" aria-level={2}>Filters</div>
                            {/* <FilterShareButton className="right-0 top-0 absolute cursor-pointer"/> */}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                        <div className="pt-0 p-10 w-full CollapsibleContent relative">
                            <FilterForm inSheet={false} projects={visibleProjects} rangeInfo={filterRangeInfo} registerReset={registerReset} registeredResets={registeredResets} resetAll={resetAll}></FilterForm>
                        </div>
                    </CollapsibleContent>
                    <CollapsibleTrigger asChild>
                        <div className="w-full h-min flex flex-row justify-center cursor-pointer">
                            <ChevronDown size={40} className={cn("relative flex tansition-all duration-300", filterExpanded ? 'rotate-180' : 'rotate-0')}></ChevronDown>
                        </div>
                    </CollapsibleTrigger>
                    {/* <div ref={sentinelRef} className="h-0 w-full"></div> */}
                </div>
            </Collapsible>
            <div className="mt-5 overflow-y-visible" ref={filterResultsRef}>
                <div className="pl-4 pr-4">
                    {
                        visibleProjects?.length
                        ? <>Showing {visibleProjects.length} project(s) matching the current filter.</>
                        : <>No projects match the current filter.</>
                    }
                </div>
                <ProjectGrid ref={gridHandle} scrollContainer={scrollContainer} />
            </div>
        <ProjectCarouselDialog 
            showToast={showToast}
            scrollTo={scrollTo}
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
        console.log('[ScrollTo]', index, jump, scrollToRef);
        // Implement your scroll logic here
        // This might involve scrolling the grid to bring the item at `index` into view
        scrollToRef.current?.(index, jump);
    }, []);

    const scrollContainer = useRef<HTMLDivElement>(null);

    return <>
        <div ref={scrollContainer} id='project-browser-wrapper' className="overflow-y-scroll inset-0 w-full h-full p-0 m-0 bg-none border-none outline-none">
        {/* <StrictMode> */}
            <AlertToast></AlertToast>
            {/* <AlertToast message={toastMessage} onClose={() => setToastMessage(null)} /> */}
            <ErrorBoundary displayName="myBoundary" callback={(err: Error) => {
                console.error(err, err.cause, err.message, err.name, err.stack);
            }}>
                <BrowserStoreProvider 
                    allProjects={projects}
                    filterRangeInfo={filterRangeInfo}
                    showToast={showToast}
                    scrollTo={scrollTo}
                >
                    <CountStoreProvider>
                        <ProjectBrowserInner 
                            filterRangeInfo={filterRangeInfo} 
                            projects={projects} 
                            contentString={contentString}
                            showToast={showToast}
                            scrollTo={scrollTo}
                            scrollToRef={scrollToRef}
                            scrollContainer={scrollContainer}
                        >
                            {children}
                        </ProjectBrowserInner>
                    </CountStoreProvider>
                </BrowserStoreProvider>
            </ErrorBoundary>
        {/* </StrictMode> */}
        </div>
    </>;
} 