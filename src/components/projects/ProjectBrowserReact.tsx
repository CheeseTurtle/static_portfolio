import React, { forwardRef, StrictMode, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type RefObject } from "react"
import ProjectGrid, { type ProjectGridHandle } from "./grid/ProjectGrid";
// import ProjectCarouselDialog from "./overlay/ProjectCarouselDialog";
import type { LightboxMediaEntryWithLBSymbols, ProjectInfo, ProjectInfoWithLBSymbols } from "./types";
import parse from "html-react-parser";
import { collectFilterRangeInfo, TAGTYPES, type FilterRangeInfo, type ScrollToFn, type ShowToastFn } from "./filtering/common/filterTypes";
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
import ErrorBoundary from "@/hooks/ErrorBoundary";
import FilterSheet from "./filtering/FilterSheet";
import type { ValueOf } from "node_modules/astro/dist/type-utils";
import getYouTubeThumbnail from "./details/getYoutubeThumbnail";
// import { createEmbed } from "./details/ProjectMedia";
import CaptionedLightboxProvider from "./CaptionedLightboxProvider";
import StickyDiv from "./StickyDiv";

const ProjectCarouselDialog = React.lazy(()=>import('./overlay/ProjectCarouselDialog'));

type ProjectBrowserProps = {
    projects: ProjectInfoWithLBSymbols[],
    contentString?: string,
    lbContentString: string,
    // epContentString?: string,
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


// function isEquivalentSet(s1: Set<any>, s2: Set<any>): boolean {
//     return (s1.size === s2.size) && [...s1].every(x=>s2.has(x));
// }

// function isEquivalentFilterState(s1: FilterState, s2: FilterState, includeOpenProject: boolean = false): boolean {
//     if(includeOpenProject && (s1.openProjectId !== s2.openProjectId)) return false;

//     if((s1.year === undefined) || (s1.year[0] === undefined && s1.year[1] === undefined)) {
//         if(!((s2.year === undefined) || (s2.year[0] === undefined && s2.year[1] === undefined)))
//             return false;
//     } else if(((s2.year === undefined) || (s2.year[0] === undefined && s2.year[1] === undefined)))
//         return false;
//     else if(s1.year[0] !== s2.year[0] || s1.year[1] !== s2.year[1])
//         return false;

//     if(!isEquivalentSet(s1.categories, s2.categories)) return false;

//     for(const tagType of TAGTYPES) {
//         const tags1 = s1.tags[tagType];
//         const tags2 = s2.tags[tagType];
//         if(!isEquivalentSet(tags1, tags2)) return false;
//     }


//     return true;
// }

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

const ProjectBrowserInner = forwardRef<ProjectBrowserHandle, ProjectBrowserInnerProps>(({ children: _children, projects: _projects, filterRangeInfo, contentElements, showToast, scrollToRef, scrollTo, scrollContainer }: ProjectBrowserInnerProps, _ref) => {
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

    
    const sheetContentRef = useRef<HTMLDivElement>(null);
    const sheetTriggerRef = useRef<HTMLButtonElement>(null);

    // const {inView, sentinelRef} = useScrollSentinel(null, 0, true, '-15% 0px 0px 0px');
    // const onInViewChange = useCallback((value: boolean, prev: boolean)=> {
    //         console.log('In view change:', prev, value);
    //     }, []);
        
    // useValueChangeWatcher<boolean, boolean>(inView, onInViewChange, {});

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
        <h1 className="text-3xl font-black align-middle self-center justify-self-center justify-center text-center w-full xl:p-10 md:p-2 sm:p-1 p-0">Projects</h1>
        <Collapsible open={filterExpanded} onOpenChange={setFilterExpanded} ref={formRef} asChild>
            <div className="flex-col flex max-w-2xl min-w-xl max-md:hidden mx-auto bg-linear-to-tr from-gray-200 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-0"> 
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
                        <ChevronDown size={40} className={cn("relative flex transition-all duration-300", filterExpanded ? 'rotate-180' : 'rotate-0')}></ChevronDown>
                    </div>
                </CollapsibleTrigger>
                {/* <div ref={sentinelRef} className="h-0 w-full"></div> */}
            </div>
        </Collapsible>
        <CaptionedLightboxProvider>
            <div className="mt-5 overflow-y-visible w-full max-w-[100vw]" ref={filterResultsRef}>
                {/* <div className="pl-4 pr-4 sticky top-[-0.8px] z-1 bg-background">{resultText}</div> */}
                <StickyDiv className='px-4 top-[-0.8px] z-1 data-[sticky-state="stuck"]:bg-background bg-none'>{resultText}</StickyDiv>
                <ProjectGrid ref={gridHandle} scrollContainer={scrollContainer} />
            </div>
            <React.Suspense fallback={<div className="absolute inset-0 w-screen h-screen bg-green-400"></div>}>
                <ProjectCarouselDialog 
                    showToast={showToast}
                    scrollTo={scrollTo}
                    contentElements={contentElements}
                />
            </React.Suspense>
        </CaptionedLightboxProvider>
         <FilterSheet 
            contentRef={sheetContentRef}
            triggerRef={sheetTriggerRef}
            projects={visibleProjects} 
            rangeInfo={filterRangeInfo} 
            registerReset={registerReset}
            resetAll={resetAll}
            registeredResets={registeredResets}
            // browserStore={store}
        />
    </>;
});



function getLightboxItems(lbContentString: string | undefined, _projects: ProjectInfoWithLBSymbols[]) {
    const ret: Record<string, React.JSX.Element> = {};
    for(const contentString of [lbContentString]) {
        if(!contentString) continue;
        const parsed = parse(contentString);
        if(typeof parsed === 'string')
            throw new TypeError('LB content source/caption cannot be a bare string');
        for(const elem of (Array.isArray(parsed) ? parsed : [parsed])) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const id = elem.props['data-item-id'] as string;
            if(id === undefined) {
                console.log(elem);
                throw new TypeError('Could not determine ID of lightbox content item');
            }
            ret[id] = elem;
        }
    }
    
    // for(const p of projects) {
    //     if(!p.lightboxData?.lightboxSources.length) continue;
    //     for(const src of p.lightboxData.lightboxSources) {
    //         if(src[0] !== 'embed') continue;
    //         const [,srcId, srcData] = src;
    //         ret[srcId] = createEmbed(srcData as ProjectMediaEmbedData);
    //     }
    // }
    return ret;
}


const extractSymPat = new RegExp('(?<=^%)(.+)(?=%$)');

function convertProjectInfo(projects: ProjectInfoWithLBSymbols[], contentRecord: Record<string, React.JSX.Element>, projectTitles: string, projectDescriptions: string, projectSummaries: string): ProjectInfo[] {
    
    const titles = parseToData(projectTitles);
    const descriptions = parseToData(projectDescriptions);
    const summaries = parseToData(projectSummaries);
    
    
    return projects.map(({lightboxData, ...p}): ProjectInfo =>{
        // console.log(lightboxData);
        let anyEmbed: boolean = false;
        const thumbnails: (string | null)[] = [];
        if(undefined === lightboxData) return p;
        const oldRecord = lightboxData.record;
        const lightboxCaptions = lightboxData.lightboxCaptions?.map(x=>{
            if(x === null)
                return x;
            const m = x.match(extractSymPat);
            if(m === null) return x;
            if(m[0] in contentRecord) return contentRecord[m[0]];
            console.warn('Record does not contain symbol:', x);
            return x;
        });
        const newRecord: Exclude<ProjectInfo['lightboxData'], undefined>['record'] = {};
        const lightboxSources = lightboxData.lightboxSources.map(([type, id, x], i)=>{
            if(type === 'embed')
                anyEmbed = true;
            const oldEntry = (oldRecord[type]!)[id];
            const caption = lightboxCaptions[i];
            const source = (()=>{
                if(typeof x === 'string') {
                    const m = x.match(extractSymPat);
                    if(m === null) return x;
                    if(!(m[0] in contentRecord))
                        throw new RangeError(`Record does not contain symbol '${String(x)}'`);
                    return contentRecord[m[0]];
                }
                // console.info('Creating embed:', x);
                return x.path;
            })();

            
            let thumbnail: string | undefined;
            
            if(type === 'embed') {
                // console.log('embed source:', source);
                const url = (oldEntry as LightboxMediaEntryWithLBSymbols<'embed'>).source.path;
                const thumbnail = getYouTubeThumbnail(url);
                thumbnails.push(thumbnail);
            } else {
                thumbnails.push(null);
            }

            // @ts-expect-error: ...
            const newEntry: ValueOf<Exclude<Exclude<ProjectInfo['lightboxData'], undefined>['record'][typeof type], undefined>> = {
                id,
                source: ((type === 'embed') ?
                    {...(oldEntry as LightboxMediaEntryWithLBSymbols<'embed'>).source, elem: source as React.JSX.Element, thumbnail} 
                    : source
                ),
                caption
            }
            if(newRecord[type])
                newRecord[type][id] = newEntry;
            else
                // @ts-expect-error Record type?
                newRecord[type] = {[id]: newEntry};
            
            return source;
        })
        // console.log('RECORD:', oldRecord, newRecord);

        if(anyEmbed)
            console.log('Sources:', lightboxSources, thumbnails);
        return {
            ...p, 
            title: titles[p.id] ?? p.title,
            description: descriptions[p.id] ?? p.description,
            summary: summaries[p.id] ?? p.summary,
            lightboxData: {
                record: newRecord,
                lightboxSources, lightboxCaptions,
                lightboxThumbs: thumbnails
            }
        };
    });
}




function parseToData(src: string): Record<string, React.JSX.Element> {
    // console.log('src:', src);
    const elems = parse(src);
    if(typeof elems === 'string') {
        throw new TypeError('Unexpected bare string');
    }
    const ret: Record<string, React.ReactElement<{'data-project-id': string}, any>> = {};
    
    for(const elem of (Array.isArray(elems) ? elems : [elems])) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const id = elem.props['data-project-id'] as string;
        if(typeof id !== 'string')
            throw new TypeError('Missing or invalid project ID on data item');
        if(id in ret) 
            throw new RangeError('Duplicate project ID');
        // console.log('elem:', elem);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ret[id] = (elem.props?.children ?? elem) as React.JSX.Element;
    }
    return ret;
}

export default function ProjectBrowser({children, projects: projectsWithLBSymbols, contentString, lbContentString, projectTitles, projectDescriptions, projectSummaries}: ProjectBrowserProps) {
    // console.log(projectsWithLBSymbols);
    const filterRangeInfo = useMemo(() => collectFilterRangeInfo(projectsWithLBSymbols), [projectsWithLBSymbols]);
    const lightboxContentElements: Record<string, React.JSX.Element> = React.useMemo(()=>getLightboxItems(lbContentString, projectsWithLBSymbols), [lbContentString, projectsWithLBSymbols]);

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
        {/* <StrictMode> */}
            <AlertToast/>
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
            </ErrorBoundary>
        {/* </StrictMode> */}
        </div>
    </>;
} 