import type { ProjectInfo } from "@/components/projects/types";
import { subscribeWithSelector } from "zustand/middleware";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { createFilterStore, type FilterDataProps, type FilterStore, type FilterStoreState, type SetFilterProps } from "./stores/filterStore";
import { collectFilterRangeInfo, getProjectKeyFromTagType, TAGTYPES, type FilterRangeInfo } from "./filterTypes";
import { createStore } from "zustand";
import React from "react";
import { useStore } from "zustand";

export function findNewIndex(ids: Iterable<string>, id: string): number | null {
    let index = 0;
    for(const projectId of ids) {
        if(id === projectId) return index;
        index++;
    }
    return null;
}

export interface BrowserStoreInitProps {
    allProjects: ProjectInfo[];
    filterRangeInfo?: FilterRangeInfo;
}

export interface BrowserStoreState {
    // Primitives
    allProjects: ProjectInfo[];
    filterRangeInfo: FilterRangeInfo;
    filterStore: FilterStore;
    
    visibleProjects: ProjectInfo[];
    activeProjectIndex: number | null;
    carouselOpen: boolean;
    sheetOpen: boolean;
    
    // Derived (cheap to compute)
    readonly visibleProjectIds: Set<string>;
    readonly activeProjectId: string | null;
    readonly openProjectId: string | null;
    
    // Actions
    setActiveProjectIndex: (index: number | null) => void;
    clickItem: (itemId: string, itemIndex: number) => void;
    setCarouselOpen: (open: boolean) => void;
    setSheetOpen: (open: boolean) => void;
    handlePopState: (showToast: ShowToastFn) => void;
    initFromUrl: (url: string, showToast: ShowToastFn) => void;

    // Handlers
    onCarouselOpenChange: (open: boolean) => void,
    onSheetOpenChange: (open: boolean) => void,
    
    // Internal
    _refilterProjects: (showToast?: ShowToastFn) => void;
    _syncUrlToState: () => void;
    
    // Utils
    getIdForIndex: (index: number) => string | null;
    getIndexForId: (id: string) => number | null;
    filterProjects: (props: FilterDataProps) => ProjectInfo[] | null;
}

export type BrowserStore = ReturnType<typeof createBrowserStore>;
export type ShowToastFn = (text: string) => void;
export type ScrollToFn = (index: number, jump?: boolean) => void;

export function parseURL(rangeInfo: FilterRangeInfo, url: string): [Partial<SetFilterProps>, string | null] {
    const params = new URLSearchParams(url);
    const category = params.get("category")?.split(",") ?? undefined;
    const lang = params.get("lang")?.split(",") ?? undefined;
    const skill = params.get("skill")?.split(",") ?? undefined;
    const topic = params.get("topic")?.split(",") ?? undefined;

    const yearParam = params.get("year");
    const [minYear_, maxYear_] = (yearParam === undefined || yearParam?.length === 0) 
        ? [undefined, undefined] 
        : (yearParam ?? "-").split("-").map(Number);
    
    const project: string | null = params.get('project') ?? null;

    return [
        { 
            category, 
            lang, 
            skill, 
            topic, 
            year: simplifyYearRange(rangeInfo, minYear_, maxYear_) 
        }, 
        project
    ];
}

export function simplifyYearRange(
    rangeInfo: FilterRangeInfo, 
    minYear_: number | null | undefined, 
    maxYear_: number | null | undefined
): [number | null, number | null] | null {
    const minYear = (minYear_ === 0 || minYear_ === undefined || minYear_ === null || Number.isNaN(minYear_) || minYear_ <= rangeInfo.minYear) 
        ? null 
        : minYear_;
    const maxYear = (maxYear_ === 0 || maxYear_ === undefined || maxYear_ === null || Number.isNaN(maxYear_) || maxYear_ >= rangeInfo.maxYear) 
        ? null 
        : maxYear_;
    return (minYear === null && maxYear === null) ? null : [minYear, maxYear];
}

export const createBrowserStore = (
    { allProjects, filterRangeInfo }: BrowserStoreInitProps,
    scrollTo?: ScrollToFn
) => {
    filterRangeInfo ??= collectFilterRangeInfo(allProjects);
    const filterStore = createFilterStore({ filterRangeInfo, allProjects });
    
    const store = createStore<BrowserStoreState>()(
        subscribeWithSelector((set, get) => ({
            allProjects,
            filterRangeInfo,
            filterStore,
            visibleProjects: [...allProjects],  // new Map(allProjects.map(p => [p.id, p])),
            activeProjectIndex: null,
            carouselOpen: false,
            sheetOpen: false,
            
            // Derived values
            get visibleProjectIds() {
                // return new Set(get().visibleProjects.keys());
                return new Set(get().visibleProjects.map(x=>x.id));
            },
            
            get activeProjectId() {
                const { activeProjectIndex } = get();
                return activeProjectIndex !== null 
                    ? get().getIdForIndex(activeProjectIndex)
                    : null;
            },
            
            get openProjectId() {
                const { carouselOpen, activeProjectId } = get();
                return carouselOpen ? activeProjectId : null;
            },
            
            // Actions
            setActiveProjectIndex: (index) => {
                if (index === get().activeProjectIndex) return;
                set({ activeProjectIndex: index });
                
                // If carousel is open, sync URL immediately
                if (get().carouselOpen) {
                    get()._syncUrlToState();
                }
            },
            
            clickItem: (itemId, itemIndex) => {
                console.log('ITEM CLICKED');
                const { activeProjectId, carouselOpen, setCarouselOpen, setActiveProjectIndex } = get();
                
                if (itemId === activeProjectId && activeProjectId !== null) {
                    // Click on already-active item opens carousel
                    // set({ carouselOpen: true });
                    setCarouselOpen(true);
                } else {
                    // Click on different item activates it
                    // set({ activeProjectIndex: itemIndex });
                    setActiveProjectIndex(itemIndex);
                }
            },
            
            setCarouselOpen: (open) => {
                const state = get();
                
                if (open) {
                    // Opening carousel
                    if (state.activeProjectIndex === null) {
                        console.warn('Cannot open carousel without active project');
                        return;
                    }
                    
                    set({ carouselOpen: true });
                    // scrollTo?.(state.activeProjectIndex, false);
                    // get()._syncUrlToState();
                } else {
                    // Closing carousel
                    set({ carouselOpen: false });
                    // get()._syncUrlToState();
                }
            },

            onCarouselOpenChange(open) {
                if(open) {
                    const activeIndex = get().activeProjectIndex;
                    if(!activeIndex)  {
                        console.warn('Cannot open carousel without active project');
                        return;
                    }
                    scrollTo?.(activeIndex, false);
                }
                get()._syncUrlToState();
            },
            
            setSheetOpen: (open) => {
                set({ sheetOpen: open });
            },

            onSheetOpenChange(open) {
                // TODO
                // if(!open) {
                //     get().
                // }
            },
            
            handlePopState: (showToast) => {
                const [filterSpec, projectId] = parseURL(
                    get().filterRangeInfo, 
                    window.location.search
                );
                
                // Update filter (this will trigger refiltering via subscription)
                filterStore.getState().setFilter(filterSpec);
                
                // After filter is applied and visibleProjects updated,
                // try to open the project from URL
                if (projectId) {
                    const index = get().getIndexForId(projectId);
                    
                    if (index !== null) {
                        set({
                            activeProjectIndex: index,
                            carouselOpen: true
                        });
                        scrollTo?.(index, false);
                    } else {
                        showToast(`Project '${projectId}' not found in current filter`);
                        
                        // If current active/open is the invalid ID, clear it
                        if (get().activeProjectId === projectId) {
                            set({
                                activeProjectIndex: null,
                                carouselOpen: false
                            });
                        }
                    }
                } else {
                    // No project in URL - just close carousel
                    set({ carouselOpen: false });
                }
            },
            
            initFromUrl: (url, showToast) => {
                const [filterSpec, projectId] = parseURL(get().filterRangeInfo, url);
                
                // Apply filter first (this will trigger refiltering via subscription)
                filterStore.getState().setFilter(filterSpec);
                
                // Then handle project ID (same logic as popstate)
                if (projectId) {
                    const index = get().getIndexForId(projectId);
                    
                    if (index !== null) {
                        set({
                            activeProjectIndex: index,
                            carouselOpen: true
                        });
                    } else {
                        showToast(`Project '${projectId}' not found`);
                    }
                }
            },
            
            // Internal methods
            _refilterProjects: (showToast) => {
                const filterData = filterStore.getState();
                const { activeProjectId } = get();
                
                const newProjects = get().filterProjects({
                    categories: filterData.categories,
                    year: filterData.year,
                    tags: filterData.tags
                });
                
                if (newProjects === null) return; // No change
                
                // const visibleProjects = new Map(newProjects.map(p => [p.id, p]));
                const visibleProjects = newProjects;
                
                // Try to maintain activeProjectIndex by looking up activeProjectId
                let newIndex: number | null = null;
                if (activeProjectId !== null) {
                    // newIndex = findNewIndex(visibleProjects.keys(), activeProjectId);
                    newIndex = findNewIndex(visibleProjects.map(x=>x.id), activeProjectId);
                    
                    if (newIndex === null && showToast) {
                        showToast(`Active project no longer matches filter`);
                    }
                }
                
                set({
                    visibleProjects,
                    activeProjectIndex: newIndex
                });
                
                // Note: We don't automatically close carousel
                // The user can still see it's filtered out
            },
            
            _syncUrlToState: () => {
                const { openProjectId } = get();
                const params = new URLSearchParams(window.location.search);
                const oldProjectId = params.get('project');
                
                // Update project parameter
                if (openProjectId) {
                    params.set('project', openProjectId);
                } else {
                    params.delete('project');
                }
                
                const query = params.toString();
                const newUrl = query ? `?${query}` : window.location.pathname;
                
                if (newUrl === window.location.href) return;
                
                // Determine push vs replace based on old/new state
                const wasNull = oldProjectId === null;
                const isNull = openProjectId === null;
                
                let method: 'pushState' | 'replaceState' | null = null;
                if (wasNull !== isNull) {
                    // Transition between null/non-null: PUSH
                    method = 'pushState';
                } else if (!wasNull && !isNull) {
                    // Both non-null (navigating between projects): REPLACE
                    method = 'replaceState';
                }
                // Both null: no change needed
                
                if (method) {
                    window.history[method](null, '', newUrl);
                }
            },
            
            // Utilities
            getIdForIndex: (index) => {
                // const keys = Array.from(get().visibleProjects.keys());
                // return keys[index] ?? null;
                const visibleProjects = get().visibleProjects;
                if(0 <= index && index < visibleProjects.length)
                    return visibleProjects[index].id;
                return null;
            },
            
            getIndexForId: (id) => {
                // return findNewIndex(get().visibleProjects.keys(), id);
                return findNewIndex(get().visibleProjects.map(x=>x.id), id);
            },
            
            filterProjects: ({ year, categories, tags }) => {
                const { visibleProjects, visibleProjectIds } = get();
                let anyChange = false;
                
                const filtered = allProjects.filter(p => {
                    const pYear = p.date.getFullYear();
                    if (year?.[0] !== null && year?.[0] !== undefined && pYear < year[0]) return false;
                    if (year?.[1] !== null && year?.[1] !== undefined && pYear > year[1]) return false;
                    if (categories.size && !categories.has(p.category)) return false;
                    
                    for (const t of TAGTYPES) {
                        const k = getProjectKeyFromTagType(t);
                        if (tags?.[t].size && ![...tags[t]].some(tag => p.tags[k]?.has(tag))) {
                            return false;
                        }
                    }
                    
                    anyChange ||= !visibleProjectIds.has(p.id);
                    return true;
                });

                anyChange ||= visibleProjects.length !== filtered.length;
                
                // Check if any previously visible project is now filtered out
                if (!anyChange) {
                    for (const id of visibleProjectIds) {
                        if (!filtered.find(p => p.id === id)) {
                            anyChange = true;
                            break;
                        }
                    }
                }
                
                return anyChange ? filtered : null;
            }
        }))
    );
    
    // Subscribe to filter changes and refilter
    filterStore.subscribe(
        (state) => ({ categories: state.categories, year: state.year, tags: state.tags }),
        () => {
            // Filter store updated, recompute visible projects
            store.getState()._refilterProjects();
        },
        { fireImmediately: false }
    );
    
    return store;
};

// Context setup
const BrowserStoreContext = React.createContext<BrowserStore | null>(null);

type BrowserStoreProviderProps = React.PropsWithChildren<BrowserStoreInitProps> & {
    showToast?: ShowToastFn;
    scrollTo?: ScrollToFn;
};

function BrowserStoreContextInner({ 
    children, 
    store, 
    showToast 
}: { 
    children: React.ReactNode; 
    store: BrowserStore;
    showToast: ShowToastFn;
}) {
    // Initialize from URL on mount
    const hasInitialized = React.useRef(false);
    
    // React.useEffect(() => {
    //     if (hasInitialized.current) return;
    //     hasInitialized.current = true;
        
    //     store.getState().initFromUrl(window.location.search, showToast);
    // }, [showToast]);
    
    // // Handle browser back/forward
    // React.useEffect(() => {
    //     const handlePopState = () => {
    //         store.getState().handlePopState(showToast);
    //     };
        
    //     window.addEventListener('popstate', handlePopState);
    //     return () => window.removeEventListener('popstate', handlePopState);
    // }, [showToast]);
    
    return <>{children}</>;
}

export function BrowserStoreProvider({ 
    children, 
    scrollTo, 
    showToast = (msg) => console.warn(msg),
    ...props 
}: BrowserStoreProviderProps) {
    const storeRef = React.useRef<BrowserStore | null>(null);
    
    if (!storeRef.current) {
        storeRef.current = createBrowserStore(props, scrollTo);
    }
    
    return (
        <BrowserStoreContext.Provider value={storeRef.current}>
            <BrowserStoreContextInner store={storeRef.current} showToast={showToast}>
                {children}
            </BrowserStoreContextInner>
        </BrowserStoreContext.Provider>
    );
}


export const doubleEq =(a: any, b: any) => (a==b);
export const tripleEq =(a: any, b: any) => (a===b);

export function useBrowserContext<T>(
    selector: (state: BrowserStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean,
): T {
    const store = React.useContext(BrowserStoreContext);
    if (!store) throw new Error('Missing BrowserStoreContext.Provider in the tree');
    // return useStoreWithEqualityFn(store, selector, (a: any, b: any) => {
    //     const result = a === b;
    //     console.log('COMPARING:', a, b, result);
    //     return result;
    // });
    // return useStoreWithEqualityFn(store, selector, equalityFn);
    // return useStore(store, selector);
    // console.log(selector);
    return equalityFn 
        ? useStoreWithEqualityFn(store, selector, equalityFn) 
        : useStore(store, selector);
}

export function useFilterContext<T>(
    selector: (state: FilterStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean,
): T {
    const filterStore = useBrowserContext(state => state.filterStore);
    // return useStoreWithEqualityFn(filterStore, selector, equalityFn);
    return equalityFn
        ? useStoreWithEqualityFn(filterStore, selector, equalityFn)
        : useStore(filterStore, selector);
}