import type { ProjectInfo } from "@/components/projects/types";
import { subscribeWithSelector } from "zustand/middleware";
import { createFilterStore, TagFilterMode, type FilterDataProps, type FilterStore, type SetFilterProps } from "./filterStore";
import { collectFilterRangeInfo, getProjectKeyFromTagType, TAGTYPES, type FilterRangeInfo, type ScrollToFn, type ShowToastFn, type TagType } from "../filterTypes";
import { createStore } from "zustand";
import {shallow} from "zustand/shallow";
// import type { ValueOf } from "node_modules/astro/dist/type-utils";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";


export enum URLSyncFlag {
    SUSPEND = 0,
    IMMEDIATE = 1,
    DEFER = 2,
    PENDING = 4,
};


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
    // Base
    readonly allProjects: ProjectInfo[];
    readonly filterRangeInfo: FilterRangeInfo;
    readonly filterStore: FilterStore;
    
    visibleProjects: ProjectInfo[];
    activeProjectIndex: number | null;
    carouselOpen: boolean;
    sheetOpen: boolean;

    urlSyncFlag: URLSyncFlag | number,

    readonly tagModes: Record<TagType, TagFilterMode>,
    
    // Derived (cheap to compute)
    /*readonly*/ visibleProjectIds: Set<string>;
    /*readonly*/ activeProjectId: string | null;
    /*readonly*/ openProjectId: string | null;

    setURLSyncFlag: (flag: URLSyncFlag, reset?: boolean) => void,
    getURLSyncFlag: () => URLSyncFlag,
    getVisibleProjectIds: (visibleProjectsArg?: ProjectInfo[]) => Set<string>;

    getActiveProjectId: (activeProjectIndexArg?: number | null) => string | null;

    getOpenProjectId: (carouselOpenArg?: boolean, activeProjectIdArg?: string | null) => string | null;

    // Actions
    setActiveProjectIndex: (index: number | null) => void;
    clickItem: (itemId: string, itemIndex: number, newState?: 'active' | 'open') => void;

    clearActiveItem: () => void;

    setCarouselOpen: (open: boolean) => void;
    setSheetOpen: (open: boolean) => void;
    handlePopState: (showToast: ShowToastFn) => void;
    initFromUrl: (url: string, showToast: ShowToastFn) => boolean;

    // Handlers
    onCarouselOpenChange: (open: boolean) => void,
    onSheetOpenChange: (open: boolean) => void,
    
    // Internal
    _refilterProjects: (showToast?: ShowToastFn) => boolean;
    _syncUrlToProjectState: () => void;
    syncUrlToFilterState: () => void;
    
    // Utils
    getIdForIndex: (index: number) => string | null;
    getIndexForId: (id: string) => number | null;
    filterProjects: (props: FilterDataProps) => ProjectInfo[] | null;
}

export type BrowserStore = ReturnType<typeof createBrowserStore>[0];


export function clearURLProject(push?: boolean) {
    const search = window.location.search;
    if(!search) return;
    const params = new URLSearchParams(search);
    params.delete('project');
    const newSearch = params.toString();
    if(newSearch === search.slice(1)) return;
}


function syncURLtoFilterState(filterRangeInfo: FilterRangeInfo, {tags, categories, year, tagModes}: FilterDataProps) {
    const params = new URLSearchParams();
    const orModes: string[] = [];
    for(const tagType of TAGTYPES) {
        const tags_ = tags?.[tagType];
        if(tags_ && tags_?.size > 0)
            params.set(tagType, Array.from(tags_).join(","));
        if(tagModes[tagType]) orModes.push(tagType);
    }
    if(orModes.length) params.set('tag_OR', orModes.join(','));
    if (categories.size > 0) 
        params.set('category', Array.from(categories).join(','));
    if (year) {
        const yearArg = simplifyYearRange(filterRangeInfo, ...year);
        if(yearArg) {
            if(yearArg[0] === yearArg[1]) {
                if(yearArg[0] !== null)
                    params.set("year", String(yearArg[0]));
            } else {
                const minYearStr = year[0] === null ? '' : `${year[0]}`;
                const maxYearStr = year[1] === null ? '' : `${year[1]}`;
                params.set("year", `${minYearStr}-${maxYearStr}`);
            }
        }
    }

    if(window.location.search) {
        const params0 = new URLSearchParams(window.location.search);
        const project = params0.get('project');
        if(project) {
            params.set('project', project);
        }
    }

    const query = params.toString();
    const newUrl = query ? `?${query}` : location.pathname;

    // pushState keeps history; replaceState overwrites it
    // window.history.replaceState(null, "", newUrl);
    if(newUrl === window.location.href)
        return;
    window.history.replaceState(null, "", newUrl);
    // window.history.pushState(null, "", newUrl);
}


export function parseURL(rangeInfo: FilterRangeInfo, url: string): [Partial<SetFilterProps>, string | null] {
    const params = new URLSearchParams(url);
    const category = params.get("category")?.split(",") ?? undefined;
    const lang = params.get("lang")?.split(",") ?? undefined;
    const skill = params.get("skill")?.split(",") ?? undefined;
    const topic = params.get("topic")?.split(",") ?? undefined;
    
    const orModes = params.get('tag_OR')?.split(',');
    const tagModes: Record<TagType, TagFilterMode> = (orModes?.length) ? (
        Object.fromEntries(TAGTYPES.map(tt=>[tt, orModes.includes(tt) ? TagFilterMode.OR : TagFilterMode.AND])) as Record<TagType, TagFilterMode>
    ) : {
        lang: TagFilterMode.AND,
        skill: TagFilterMode.AND,
        topic: TagFilterMode.AND
    };

    const yearParam = params.get("year");
    const [minYear_, maxYear_] = (yearParam === undefined || yearParam === null || yearParam === '-' || yearParam?.length === 0)
        ? [undefined, undefined] 
        : ((arr)=>arr.length === 1 ? [arr[0],arr[0]] : arr)((yearParam ?? "-").split("-").map(Number));
    
    const project: string | null = params.get('project') ?? null;


    return [
        { 
            category, 
            lang, 
            skill, 
            topic, 
            year: simplifyYearRange(rangeInfo, minYear_, maxYear_),
            tagModes
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

            urlSyncFlag: URLSyncFlag.DEFER,
            
            // Derived values
            visibleProjectIds: new Set<string>(allProjects.map(x=>x.id)),
            getVisibleProjectIds() {
                // return new Set(get().visibleProjects.keys());
                return new Set(get().visibleProjects.map(x=>x.id));
            },
            
            activeProjectId: null,
            getActiveProjectId(activeProjectIndexArg?: number | null) {
                const activeProjectIndex = activeProjectIndexArg ?? get().activeProjectIndex
                return activeProjectIndex !== null 
                    ? get().getIdForIndex(activeProjectIndex)
                    : null;
            },
            
            openProjectId: null,
            getOpenProjectId(carouselOpenArg?: boolean, activeProjectIdArg?: string | null) {
                const { carouselOpen, activeProjectId } = get();
                return (carouselOpenArg ?? carouselOpen) ? (activeProjectIdArg ?? activeProjectId) : null;
            },

            get tagModes() {
                const filterStore = get().filterStore;
                return filterStore.getState().tagModes;
            },
            
            // Actions
            setActiveProjectIndex: (index) => {
                if (index === get().activeProjectIndex) return;
                set({ activeProjectIndex: index });
                
                // If carousel is open, sync URL immediately
                if (get().carouselOpen) {
                    get()._syncUrlToProjectState();
                }
            },
            
            clickItem: (itemId, itemIndex, newState?: 'active' | 'open') => {
                const { activeProjectId, carouselOpen, setCarouselOpen, setActiveProjectIndex } = get();
                // console.log('ITEM CLICKED', activeProjectId, carouselOpen, itemId, itemIndex, newState);

                if(newState === undefined) {
                    if (itemId === activeProjectId && activeProjectId !== null) {
                        // Click on already-active item opens carousel
                        // set({ carouselOpen: true });
                        setCarouselOpen(true);
                    } else {
                        // Click on different item activates it
                        // set({ activeProjectIndex: itemIndex });
                        setActiveProjectIndex(itemIndex);
                    }
                } else {
                    set({
                        activeProjectIndex: itemIndex,
                        activeProjectId: itemId
                    });
                    if(newState === 'open')
                        setCarouselOpen(true);
                }
            },

            clearActiveItem() {
                // Assume the carousel is not open
                set({activeProjectIndex: null/*, openProjectId: null*/});
                // set({activeProjectId: null});
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
                }
                get()._syncUrlToProjectState();
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
                get()._syncUrlToProjectState();
            },
            
            setSheetOpen: (open) => {
                set({ sheetOpen: open });
            },

            onSheetOpenChange(_open) {
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
                        clearURLProject();
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
                        // clearURLProject();
                    }

                    return true;
                }
                if(filterSpec.year && (filterSpec.year[0] || filterSpec.year[1])) return true;
                if(filterSpec.category && filterSpec.category.keys().next().value !== undefined)
                    return true;
                if(filterSpec.lang && (Array.isArray(filterSpec.lang) ? filterSpec.lang.length : filterSpec.lang.size))
                    return true;
                if(filterSpec.skill && (Array.isArray(filterSpec.skill) ? filterSpec.skill.length : filterSpec.skill.size))
                    return true;
                if(filterSpec.topic && (Array.isArray(filterSpec.topic) ? filterSpec.topic.length : filterSpec.topic.size))
                    return true;
                return false;
            },
            
            // Internal methods
            _refilterProjects: (showToast) => {
                const filterData = filterStore.getState();
                const { activeProjectId } = get();
                
                const newProjects = get().filterProjects({
                    categories: filterData.categories,
                    year: filterData.year,
                    tags: filterData.tags,
                    tagModes: filterData.tagModes
                });
                
                if (newProjects === null) return false; // No change
                
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

                return true;
            },
            
            _syncUrlToProjectState: () => {
                const { openProjectId } = get();
                const params = new URLSearchParams(window.location.search);
                const oldProjectId = params.get('project');
                
                // Update project parameter
                if (openProjectId) {
                    params.set('project', openProjectId);
                } else {
                    params.delete('project');
                }
                
                const newQuery = params.toString();
                if (newQuery === window.location.search.slice(1)) return;
                const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
                
                
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

            syncUrlToFilterState: () => {
                syncURLtoFilterState(filterRangeInfo, filterStore.getState());
            },
            
            // Utilities
            getIdForIndex: (index) => {
                const visibleProjects = get().visibleProjects;
                if(0 <= index && index < visibleProjects.length)
                    return visibleProjects[index].id;
                return null;
            },
            
            getIndexForId: (id) => {
                return findNewIndex(get().visibleProjects.map(x=>x.id), id);
            },
            
            filterProjects: ({ year, categories, tags, tagModes }) => {
                const { visibleProjects, visibleProjectIds } = get();
                let anyChange = false;
                
                const filtered = allProjects.filter(p => {
                    const pYear = p.date.getFullYear();
                    if (year?.[0] !== null && year?.[0] !== undefined && pYear < year[0]) return false;
                    if (year?.[1] !== null && year?.[1] !== undefined && pYear > year[1]) return false;
                    if (categories.size && !categories.has(p.category)) return false;
                    
                    // TODO
                    for (const t of TAGTYPES) {
                        const k = getProjectKeyFromTagType(t);
                        if (tags?.[t].size && (
                            !tagModes[t] ? [...tags[t]].some(tag => !p.tags[k]?.has(tag))
                            // : ![...tags[t]].some(tag => p.tags[k]?.has(tag))
                            : !(p.tags[k] && Array.from(p.tags[k]).some(tag=>tags[t].has(tag)))
                        )) {
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

                console.log('anyChange:', anyChange);
                
                return anyChange ? filtered : null;
            },

            setURLSyncFlag(flag, reset?: boolean) {
                const currFlag = get().urlSyncFlag;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
                if(reset ? flag === currFlag : (!flag || (flag & currFlag))) return;
                console.log('Setting sync flag:', currFlag | flag);
                set({urlSyncFlag: reset ? flag : currFlag | flag});
            },

            getURLSyncFlag() {
                const currFlag = get().urlSyncFlag;
                if(!currFlag) return URLSyncFlag.SUSPEND;
                if(currFlag & URLSyncFlag.IMMEDIATE)
                    return URLSyncFlag.IMMEDIATE;
                if(currFlag & URLSyncFlag.DEFER)
                    return URLSyncFlag.DEFER;
                return URLSyncFlag.PENDING;
            },
        }))
    );

    // const initState = store.getInitialState();
    // const getSyncFlag = initState.getURLSyncFlag;
    // const setSyncFlag = initState.setURLSyncFlag;

    const debounced = useDebounceCallback(syncURLtoFilterState, 300);

    // Subscribe to filter changes and refilter
    filterStore.subscribe(
        (state) => ({ categories: state.categories, year: state.year, tags: state.tags, tagModes: state.tagModes }),
        ({categories, year, tags, tagModes}) => {
            console.log('Filter store updated');
            // Filter store updated, recompute visible projects
            if(store.getState()._refilterProjects()) {
                const syncFlag = store.getState().getURLSyncFlag();
                console.log('Refiltered; sync flag:', syncFlag);
                if(!syncFlag) return;
                switch(syncFlag) {
                    case URLSyncFlag.DEFER: {
                        console.log('Debouncing');
                        debounced(filterRangeInfo, {categories, year, tags, tagModes});
                        break;
                    }
                    case URLSyncFlag.IMMEDIATE: {
                        debounced.cancel();
                        console.log('Calling');
                        syncURLtoFilterState(filterRangeInfo, {categories, year, tags, tagModes});
                        // store.setState({urlSyncFlag: URLSyncFlag.DEFER});
                        store.getState().setURLSyncFlag(URLSyncFlag.DEFER, true);
                        break;
                    }
                    default:
                        return;
                }
            }
        },
        { fireImmediately: false }
    );

    store.subscribe(s=>s.urlSyncFlag, (flag, prevFlag) => {
        if((flag & URLSyncFlag.IMMEDIATE) && !(prevFlag & URLSyncFlag.IMMEDIATE)) {
            console.log('Switched from non-immediate to immediate');
            debounced.cancel();
            syncURLtoFilterState(filterRangeInfo, filterStore.getState());
        } else if((flag & URLSyncFlag.DEFER) && !(prevFlag & (URLSyncFlag.DEFER | URLSyncFlag.IMMEDIATE))) {
            console.log('Switched from suspended or pending to deferred');
            // if(!debounced.isPending()) 
            debounced(filterRangeInfo, filterStore.getState());
        } else if(!flag && prevFlag)
            debounced.flush();
    });

    store.subscribe((s=>s.visibleProjects), (projects, prevProjects) => {
        if(shallow(projects, prevProjects)) return;
        store.setState({visibleProjectIds: new Set<string>(projects.map(x=>x.id))});
    }, {fireImmediately: true});

    store.subscribe(s=>s.activeProjectIndex, (index, prevIndex) => {
        if(index === prevIndex) return;
        const activeProjectId = store.getState().getActiveProjectId(index);
        store.setState({activeProjectId});
    }, {fireImmediately: true});

    store.subscribe(s=>({carouselOpen: s.carouselOpen, activeProjectId: s.activeProjectId}), ({carouselOpen, activeProjectId}, {carouselOpen: prevCarouselOpen, activeProjectId: prevActiveProjectId}) => {
        if(carouselOpen === prevCarouselOpen && activeProjectId === prevActiveProjectId) return;
        
        if(carouselOpen && !prevCarouselOpen && debounced.isPending())
            debounced.flush();

        const openProjectId = store.getState().getOpenProjectId(carouselOpen, activeProjectId);
        store.setState({openProjectId});
    }, {fireImmediately: true});
    
    return [store, debounced] as [typeof store, typeof debounced];
};
