import React, { forwardRef, StrictMode, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type RefObject } from "react"
import ProjectGrid, { type ProjectGridHandle } from "./grid/ProjectGrid";
// import ProjectCarouselDialog from "./overlay/ProjectCarouselDialog";
import type { ProjectInfo, ProjectInfoWithLBSymbols } from "./types";
import parse from "html-react-parser";
import { collectFilterRangeInfo, TAGKEYS, TAGTYPES, type FilterRangeInfo, type FilterState, type ScrollToFn, type ShowToastFn } from "./filtering/common/filterTypes";
import AlertToast from "./toasts";

import { BrowserStoreProvider, useBrowserContext, useFilterStore } from "./filtering/common/browserContext";
import { toast } from "sonner";
import FilterForm from "./filtering/FilterForm";
// import {useScrollSentinel, useValueChangeWatcher} from "./scrolling";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountStoreProvider, useCountContext } from "./filtering/common/stores/countStoreContext";
// import ErrorBoundary from "@/hooks/ErrorBoundary";
import { useDomReady } from "@/hooks/use-dom-ready";
import type { FilterStoreState } from "./filtering/common/stores/filterStore";

const ProjectCarouselDialog = React.lazy(()=>import('./overlay/ProjectCarouselDialog'));

type ProjectBrowserProps = {
    projects: ProjectInfoWithLBSymbols[],
    contentString?: string,
    lbContentString: string,
    children?: {props?: {value: string}},
    projectTitles: string,
    projectSummaries: string,
    projectDescriptions: string,
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

function anyFilter(){
    const params = new URLSearchParams(window.location.search);
    if(!params.size) return false;
    return ['year','category',...TAGTYPES].some((k)=>params.has(k));
}

type ProjectBrowserInnerProps = Omit<ProjectBrowserProps, 'projects' | 'lbContentString' | 'symMap' | 'contentString' | 'projectTitles' | 'projectDescriptions' | 'projectSummaries'> & {
    filterRangeInfo: FilterRangeInfo, scrollToRef: RefObject<ScrollToFn | undefined>, scrollTo: ScrollToFn, scrollContainer: RefObject<any>,
    showToast: ShowToastFn,
    projects: ProjectInfo[],
    contentElements: React.JSX.Element[],
};

const ProjectBrowserInner = forwardRef<ProjectBrowserHandle, ProjectBrowserInnerProps>(({ children, projects, filterRangeInfo, contentElements, showToast, scrollToRef, scrollTo, scrollContainer }: ProjectBrowserInnerProps, _ref) => {
    console.log('[ProjectBrowserInner] Render start', {
        url: window.location.href,
        search: window.location.search,
    });

    const formRef = useRef<HTMLDivElement>(null);
    const gridHandle = useRef<ProjectGridHandle>(null);
    const filterResultsRef = useRef<HTMLDivElement>(null);
    
    useEffect(()=>{
        scrollToRef.current = gridHandle.current?.scrollToItem;
        // console.log(gridRef, scrollToRef);
    });

    // Get state from stores
    const visibleProjects = useBrowserContext(s=>s.visibleProjects);
    const clearActiveItem = useBrowserContext(s=>s.clearActiveItem);
    

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
        
        const opts: AddEventListenerOptions = { capture: false };
        document.addEventListener('click', handler, opts);
        return () => document.removeEventListener('click', handler, opts);
    }, [clearActiveItem]);

    /*
        const handleRef = useRef<ProjectBrowserHandle>({
            getActiveProject: () => activeProject,
            getActiveIndex: () => activeProjectIndex,
            setActiveProject: setActiveProjectFromId,
            setOpenProjectFromId: setOpenProjectFromId
        });

        
        // Update ref when callbacks change
        React.useEffect(() => {
            handleRef.current = {
                getActiveProject: () => activeProject,
                getActiveIndex: () => activeProjectIndex,
                setActiveProject: setActiveProjectFromId,
                setOpenProjectFromId: setOpenProjectFromId
            };
        }, [activeProject, activeProjectIndex, setActiveProjectFromId, setOpenProjectFromId]);

        useImperativeHandle(ref, () => handleRef.current, []);
    */

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

    
    /*
    // const {inView, sentinelRef} = useScrollSentinel(null, 0, true, '-15% 0px 0px 0px');

    // // const sheetContentRef = useRef<HTMLDivElement>(null);
    // // const sheetTriggerRef = useRef<HTMLButtonElement>(null);
    // const onInViewChange = useCallback((value: boolean, prev: boolean)=> {
        //     console.log('In view change:', prev, value);
        // }, []);
        
        // useValueChangeWatcher<boolean, boolean>(inView, onInViewChange, {});
    */

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


    console.log('[ProjectBrowserInner] Render end');

    const resultText = useMemo(()=>(
        visibleProjects?.length
        ? <>Showing {visibleProjects.length} project(s) matching the current filter.</>
        : <>No projects match the current filter.</>
    ), [visibleProjects]);

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
            <div className="flex-col flex max-w-2xl min-w-xl mx-auto  bg-linear-to-tr from-gray-200 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-0"> 
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
            <div className="pl-4 pr-4">{resultText}</div>
            <ProjectGrid ref={gridHandle} scrollContainer={scrollContainer} />
        </div>
        <ProjectCarouselDialog 
            showToast={showToast}
            scrollTo={scrollTo}
            contentElements={contentElements}
        />
    </>;
});



function getLightboxItems(lbContentString: string | undefined) {
    if(!lbContentString) return {};
    const parsed = parse(lbContentString);
    if(typeof parsed === 'string')
        throw new TypeError('LB content source/caption cannot be a bare string');
    const ret: Record<string, React.JSX.Element> = {};
    for(const elem of (Array.isArray(parsed) ? parsed : [parsed])) {
        const id = elem.props['data-item-id'];
        if(id === undefined) {
            console.log(elem);
            throw new TypeError('Could not determine ID of lightbox content item');
        }
        ret[id] = elem;
    }
    return ret;
}


const extractSymPat = new RegExp('(?<=^%)(.+)(?=%$)');

function convertProjectInfo(projects: ProjectInfoWithLBSymbols[], record: Record<string, React.JSX.Element>, projectTitles: string, projectDescriptions: string, projectSummaries: string): ProjectInfo[] {
    
    const titles = parseToData(projectTitles);
    const descriptions = parseToData(projectDescriptions);
    const summaries = parseToData(projectSummaries);

    return projects.map(({lightboxData, ...p})=>{
        // console.log(lightboxData);
        if(undefined === lightboxData) return p;
        const lightboxCaptions = lightboxData.lightboxCaptions?.map(x=>{
            if(x === null)
                return x;
            const m = x.match(extractSymPat);
            if(m === null) return x;
            if(m[0] in record) return record[m[0]];
            console.warn('Record does not contain symbol:', x);
            return x;
        });
        const lightboxSources = lightboxData.lightboxSources.map(x=>{
            const m = x.match(extractSymPat);
            if(m === null) return x;
            if(m[0] in record) return record[m[0]];
            throw new RangeError(`Record does not contain symbol '${String(x)}'`);
        })
        return {
            ...p, 
            title: titles[p.id] ?? p.title,
            description: descriptions[p.id] ?? p.description,
            summary: summaries[p.id] ?? p.summary,
            lightboxData: {
                lightboxSources, lightboxCaptions
            }
        };
    });
}




function parseToData(src: string): Record<string, React.JSX.Element> {
    console.log('src:', src);
    const elems = parse(src);
    if(typeof elems === 'string') {
        throw new TypeError('Unexpected bare string');
    }
    const ret: Record<string, React.ReactElement<{'data-project-id': string}, any>> = {};
    
    for(const elem of (Array.isArray(elems) ? elems : [elems])) {
        const id = elem.props['data-project-id'] as string;
        if(typeof id !== 'string')
            throw new TypeError('Missing or invalid project ID on data item');
        if(id in ret) 
            throw new RangeError('Duplicate project ID');
        console.log('elem:', elem);
        ret[id] = (elem.props?.children ?? elem) as React.JSX.Element;
    }
    return ret;
}

export default function ProjectBrowser({children, projects: projectsWithLBSymbols, contentString, lbContentString, projectTitles, projectDescriptions, projectSummaries}: ProjectBrowserProps) {
    // console.log(projectsWithLBSymbols);
    const filterRangeInfo = useMemo(() => collectFilterRangeInfo(projectsWithLBSymbols), [projectsWithLBSymbols]);
    const lightboxContentElements: Record<string, React.JSX.Element> = React.useMemo(()=>getLightboxItems(lbContentString), [lbContentString]);

    // console.log('TITLES:', titles);

    const projects = useMemo(()=>convertProjectInfo(projectsWithLBSymbols, lightboxContentElements, projectTitles, projectDescriptions, projectSummaries), [projectsWithLBSymbols, lightboxContentElements, projectTitles, projectDescriptions, projectSummaries]);
    
    if (!contentString) {
        // contentString = children!.props!.value;
        throw new Error('No project details content provided');
    }

    const _contentElements = parse(contentString);
    const contentElements = (
        (typeof _contentElements === 'string') 
            ? [<>{_contentElements}</>] 
            : Array.isArray(_contentElements) 
                ? _contentElements 
                : [_contentElements]
    ).filter((x) => typeof x === 'object');

    const showToast = React.useCallback((message: string) => {
        console.warn('[Toast]', message, 
            toast.error(message, {})
        );
        // setToastMessage(message);
        // Auto-clear toast after a few seconds
        // setTimeout(() => setToastMessage(null), 5000);
    }, []);
    
    
    const scrollToRef = React.useRef<ScrollToFn | undefined>(undefined);
    const scrollContainer = useRef<HTMLDivElement>(null);
    const scrollTo = React.useCallback<ScrollToFn>((index: number, jump?: boolean) => {
        console.log('[ScrollTo]', index, jump, scrollToRef);
        // Implement your scroll logic here
        // This might involve scrolling the grid to bring the item at `index` into view
        scrollToRef.current?.(index, jump);
    }, []);

    return <>
        <div ref={scrollContainer} id='project-browser-wrapper' className="overflow-y-scroll inset-0 w-full h-full p-0 m-0 bg-none border-none outline-none">
        <StrictMode>
            <AlertToast/>
            {/* <AlertToast message={toastMessage} onClose={() => setToastMessage(null)} /> */}
            {/* <ErrorBoundary displayName="myBoundary" callback={(err: Error) => {
                console.error(err, err.cause, err.message, err.name, err.stack);
            }}> */}
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
                            contentElements={contentElements}
                            showToast={showToast}
                            scrollTo={scrollTo}
                            scrollToRef={scrollToRef}
                            scrollContainer={scrollContainer}
                        >
                            {children}
                        </ProjectBrowserInner>
                    </CountStoreProvider>
                </BrowserStoreProvider>
            {/* </ErrorBoundary> */}
        </StrictMode>
        </div>
    </>;
} 