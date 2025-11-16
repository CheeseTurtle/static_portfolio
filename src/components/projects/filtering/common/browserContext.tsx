// import type { ProjectInfo } from "@/components/projects/types";
import { useStore, type StoreApi, type UseBoundStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { createBrowserStore, findNewIndex, type BrowserStore, type BrowserStoreInitProps, type BrowserStoreState, type UISliceState } from "./stores/browserStore";
import React from "react";
import type { FilterDataProps, FilterStore, FilterStoreProps, FilterStoreState, SetFilterProps } from "./stores/filterStore";
import type { ProjectInfo } from "../../types";
import { TAGTYPES, type FilterRangeInfo } from "./filterTypes";


const BrowserStoreContext = React.createContext<BrowserStore | null>(null);

type ShowToastFn = (text: string) => void;
type ScrollToFn = (index: number, jump?: boolean) => void;

type BrowserStoreProviderProps = React.PropsWithChildren<BrowserStoreInitProps> & {showToast?: ShowToastFn, scrollTo?: ScrollToFn};


function subscribeToFilterStore(filterStore: FilterStore, listener: (state: FilterDataProps, prevState: FilterDataProps) => void, fireImmediately?: boolean) {

    return filterStore.subscribe(s=>({
        categories: s.categories,
        year: s.year,
        tags: s.tags
    }), listener, {fireImmediately, equalityFn(a, b) {
        // TODO: Write equality function
        return a == b;
    },})
}


// import { useEffect, useRef } from "react"
// import { useFilter } from "./common/filterContext";
// import { TAGTYPES, type FilterRangeInfo, type FilterState, type InitFromURL } from "./common/filterTypes";


export function simplifyYearRange(rangeInfo: FilterRangeInfo, minYear_: number | null | undefined, maxYear_: number | null | undefined): [number | null, number | null] | null {
    const minYear = (minYear_ === 0 || minYear_ === undefined || minYear_ === null || Number.isNaN(minYear_) || minYear_ <= rangeInfo.minYear) ? null : minYear_;
    const maxYear = (maxYear_ === 0 || maxYear_ === undefined || maxYear_ === null || Number.isNaN(maxYear_) || maxYear_ >= rangeInfo.maxYear) ? null : maxYear_;
    return (minYear === null && maxYear === null) ? null : [minYear, maxYear];
}

export function FilterURLSync({rangeInfo}: {rangeInfo: FilterRangeInfo}) {
  const state = useFilterContext(({categories, tags, year})=>({categories, tags, year}));

  React.useEffect(() => {
    const params = new URLSearchParams();
    for(const tagType of TAGTYPES) {
        const tags = state.tags[tagType];
        if(tags.size > 0)
            params.set(tagType, Array.from(tags).join(","));
    }
    if (state.categories.size > 0) 
        params.set('category', Array.from(state.categories).join(','));
    if (state.year) {
      const yearArg = simplifyYearRange(rangeInfo, ...state.year);
      if(yearArg) {
        const minYearStr = state.year[0] === undefined ? '' : `${state.year[0]}`;
        const maxYearStr = state.year[1] === undefined ? '' : `${state.year[1]}`;
        params.set("year", `${minYearStr}-${maxYearStr}`);
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
    window.history.pushState(null, "", newUrl);
  }, [state.categories, state.tags, state.year]);

  return null;
}

export function parseURL(rangeInfo: FilterRangeInfo, url: string): [Partial<SetFilterProps>, string | null] {
  const params = new URLSearchParams(url);
  const category = params.get("category")?.split(",") ?? undefined
    const lang = params.get("lang")?.split(",") ?? undefined
    const skill = params.get("skill")?.split(",") ?? undefined
    const topic = params.get("topic")?.split(",") ?? undefined

    const yearParam = params.get("year");
    const [minYear_, maxYear_] = (yearParam === undefined || yearParam?.length === 0) ? [undefined, undefined] : (yearParam ?? "-").split("-").map(Number);
    
    const project: string | null = params.get('project') ?? null;

    return [{category, lang, skill, topic, year: simplifyYearRange(rangeInfo, minYear_, maxYear_)}, project]
}



export function useInitializeFromURL(rangeInfo: FilterRangeInfo, browserStore: BrowserStore, filterStore: FilterStore, showToast: ShowToastFn) {
  // const { dispatch, carouselOpen, setCarouselOpen, browser } = useFilter();
  const hasInitialized = React.useRef<boolean>(false);

  console.log('[useInitializeFromURL] Render', {
    hasInitialized: hasInitialized.current,
    search: window.location.search
  });

  React.useEffect(() => {
    console.log('[useInitializeFromURL] Effect running', {
      hasInitialized: hasInitialized.current,
      search: window.location.search
    });
    // if(!browser) return;
    if(hasInitialized.current) {
      console.log('[useInitializeFromURL] Already initialized, skipping');
      return;
    }
    hasInitialized.current = true;

    setStateFromURL(browserStore, filterStore, showToast, window.location.search);


    // console.log('[useInitializeFromURL] Parsing URL:', window.location.search);
    
    // const [parsed, project] = parseURL(rangeInfo, window.location.search);

    // Apply filter state
    // dispatch({
    //   type: "INIT_FROM_URL",
    //   payload: {...parsed, project}
    // });

    console.log('[useInitializeFromURL] Dispatched INIT_FROM_URL', {...parsed, project});

    // console.log('browser:', browser);

    // if(project) {
    //   setCarouselOpen(true);
    // }


    // browser?.setOpenProjectFromId(project);
  }, [browserStore, filterStore, rangeInfo]);
}


function extractItems<S extends StoreApi<any>, T extends Partial<ReturnType<S['getState']>>>(store: S, selector: (state: ReturnType<typeof store['getState']>) => T) {
  return selector(store.getState());
}

function extractObjectKeys<P, K extends (keyof P)>(obj: P, keys: K[]): Pick<P,K> {
  // return Object.fromEntries(keys.filter(k=>Object.prototype.hasOwnProperty.call(obj, k)).map(k=>[k, obj[k]]));
  // return Object.fromEntries(keys.filter(k=>Object.hasOwn(obj, k)).map(k=>[k, obj[k]]));
  const result = {} as Pick<P, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key))
      result[key] = obj[key];
  }
  return result;
}


type FirstTypeParameter<T extends StoreApi<any>> = (T extends StoreApi<infer P> ? P : never);

// function extractKeys<S extends StoreApi<P>, K extends (keyof P), P>(store: S, keys: K[]): Pick<P, K> {
function extractKeys<S extends StoreApi<any>, K extends (keyof FirstTypeParameter<S>)>(store: S, keys: K[]): Pick<FirstTypeParameter<S>, K> {
  return extractObjectKeys(store.getState(), keys);
}


export function URLProjectSync(browserStore: BrowserStore, showToast: ShowToastFn) {
  const hasInitialized = React.useRef<boolean>(false);
  
  
  const urlProjectId = useBrowserContext(s=>s.urlProjectId);
  const deferredUrlProjectId = React.useDeferredValue(urlProjectId, null);

  console.log('[URLSync]', window.location.href, window.location.search, urlProjectId, extractKeys(browserStore, ['activeProjectId', 'activeProjectIndex', 'carouselOpen', 'openProjectId', 'urlProjectId'])); 

  // Update when urlProjectId changes
  React.useEffect(() => {
    const state = browserStore.getState();

    if (!hasInitialized.current) {
      console.log('[ProjectURLSync] First run, skipping to preserve initial URL');
      hasInitialized.current = true;
      return;
    }

    console.log('[ProjectURLSync] Effect running (after initialization)', {
      openProjectId: state.openProjectId,
      url: window.location.href,
      deferredUrlProjectId: deferredUrlProjectId,
    });
    const params = new URLSearchParams(window.location.search);
    const oldProject = params.get('project');

    // if(!oldProject && !deferredUrlProjectId) {
    //   console.log('[ProjectURLSync] Returning because both are null')
    //   return;
    // }

    const replace = !!!oldProject === !!!state.openProjectId;
    // if(oldProject != null || (state.openProjectId != null && state.openProjectId !== undefined))
    //   if(state._urlReplace !== undefined) console.assert(replace === state._urlReplace, `${replace} !== ${state._urlReplace} (${oldProject}, ${state.openProjectId})`);

    if(state.openProjectId !== deferredUrlProjectId) {
      const newIndex = (state.activeProjectId === deferredUrlProjectId ? state.activeProjectIndex : (deferredUrlProjectId ? state.getIndexForId(deferredUrlProjectId) : undefined));
      if(newIndex === null) {  // TODO: Try to use currently-open instead, if there is one (replace history, not push)??
        showToast(`No project with the id '${deferredUrlProjectId}' matching the current filter found.`);
        return;
        // browserStore.setState({deferred})
        
      }
    }




    if (deferredUrlProjectId) {
      // if(oldProject === state.openProjectId) return;
      params.set('project', deferredUrlProjectId);
    // } else if(params.get('project') === undefined) {
    //   return;
    } else {
      params.delete('project');
    }


    const query = params.toString();
    
    if(query === window.location.search) return;
    
    const newUrl = query ? `?${query}` : window.location.pathname;

    if (newUrl === window.location.href) return;
  
    console.assert(oldProject != null || (state.openProjectId != null && state.openProjectId !== undefined));
    
    const method = replace ? 'replaceState' : 'pushState';

    // Use replaceState to avoid polluting history with intermediate project changes
    window.history[method](null, "", newUrl);
  }, [browserStore, deferredUrlProjectId]);

  return null;
}




export function useInitializeFilterFromURL(rangeInfo: FilterRangeInfo) {
  const { dispatch, carouselOpen, setCarouselOpen } = useFilter()

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get("category")?.split(",") ?? undefined
    const lang = params.get("lang")?.split(",") ?? undefined
    const skill = params.get("skill")?.split(",") ?? undefined
    const topic = params.get("topic")?.split(",") ?? undefined

    const yearParam = params.get("year");
    const [minYear_, maxYear_] = (yearParam === undefined || yearParam?.length === 0) ? [undefined, undefined] : (yearParam ?? "-").split("-").map(Number);
    
    const project: string | null = params.get('project') ?? null;

    dispatch({
      type: "INIT_FROM_URL",
      payload: { category, lang, skill, topic, year: simplifyYearRange(rangeInfo, minYear_, maxYear_), project},
    })
  }, [dispatch]);
}



function setStateFromSpec(browserStore: BrowserStore, filterStore: FilterStore, showToast: ShowToastFn, spec: Partial<SetFilterProps>, projectId?: string | null) {
    // Set filterStore values based on URL;
    // apply new values to get new visibleProjects;
    // try to get index of given id  ==> set active/open,
    // otherwise show toast

    const setFilter = useStore(filterStore, s=>s.setFilter);
    if(projectId === null) {
      browserStore.setState({openProjectId: null, urlProjectId: null});
    } else {
      // const filterProjects = useStore(browserStore, s=>s.filterProjects);
      // const filterProps: FilterDataProps = {
      //   categories: new Set<string>(spec.category ?? []),
      //   year: spec.year ?? null,
      //   tags: {
      //     lang: new Set<string>(spec.lang ?? []),
      //     skill: new Set<string>(spec.skill ?? []),
      //     topic: new Set<string>(spec.topic ?? [])
      //   }
      // };
      // const newVisibleProjects = filterProjects(filterProps) ?? undefined;
      browserStore.setState({urlProjectId: projectId});
    }
    setFilter(spec);
}

function setStateFromURL(browserStore: BrowserStore, filterStore: FilterStore, showToast: ShowToastFn, query: string) {
    // const query = window.location.search;
    const filterRangeInfo = useStore(browserStore, s=>s.filterRangeInfo);
    const [spec, project] = parseURL(filterRangeInfo, query);
    setStateFromSpec(browserStore, filterStore, showToast, spec, project);   
}





function BrowserStoreContextInner({children, store, scrollTo, showToast, allProjects}: React.PropsWithChildren<{store: BrowserStore}> & {scrollTo?: ScrollToFn, showToast?: ShowToastFn, allProjects: ProjectInfo[]}) {

    // const browserStore = storeRef.current;
    // if(!browserStore) return null;

    const {filterRangeInfo} = useBrowserContext(s=>({filterRangeInfo: s.filterRangeInfo}));
    const filterStore = useBrowserContext(s=>s.filterStore);

    // Subscribe to changes in filterStore
    React.useEffect(() => {
        const unsubscribe = subscribeToFilterStore(filterStore, (state, prevState) => {
            const {filterProjects: applyFilter, activeProjectId} = useBrowserContext(s=>({filterProjects: s.filterProjects, activeProjectId: s.activeProjectId}));
            
            // TODO: Shallow comparison of state and prevState?

            // const filterResult = applyFilter({allProjects, filterRangeInfo, ...state});
            const filterResult = applyFilter(state);
            if(filterResult === null) return; // No change

            if(activeProjectId === null || activeProjectId === undefined) {
                store.setState({visibleProjects: new Map<string, ProjectInfo>(filterResult.map(p=>[p.id,p]))});
                return;
            }
            const newIndex_ = filterResult.findIndex((p)=>p.id === activeProjectId);
            const newIndex = newIndex_ < 0 ? null : newIndex_;

            store.setState({
                visibleProjects: new Map<string, ProjectInfo>(filterResult.map(p=>[p.id,p])),
                activeProjectIndex: newIndex,
                activeProjectId: newIndex === null ? null : undefined  // filterResult[newIndex].id
            });
            // TODO: Push history (conditionally)
        });

        return unsubscribe;
    }, [store, filterStore, allProjects, filterRangeInfo]);


    // Subscribe to changes in activeProjectIndex
    React.useEffect(()=>{
        return store.subscribe(s=>({open: s.carouselOpen, activeId: s.activeProjectId}), ({open, activeId}, {open: wasOpen, activeId: prevActiveId}) => {
            const activeIndex = useStore(store, s=>s.activeProjectIndex);
            if(activeId === prevActiveId) {
                if(open === wasOpen) return;

                if(open) {
                    // const activeProjectId = useStore(store, s=>s.activeProjectId);
                    if(activeId)
                        store.setState({openProjectId: activeId});
                    else
                        store.setState({carouselOpen: false});
                    if(activeIndex !== null) scrollTo?.(activeIndex, false);
                } else {
                    store.setState({openProjectId: null});
                }
            } else if(open) {
                store.setState({openProjectId: activeId}); // Replace history
                if(activeIndex !== null) scrollTo?.(activeIndex, false);  // Or move this elsewhere?
            }
        }, {});
    }, [store]);

    
    // Subscribe to changes in activeProjectId
    React.useEffect(() => {
        return store.subscribe(s=>s.activeProjectId, (activeId, prevActiveId) => {
            const open = useStore(store, s=>s.carouselOpen);
            if(open) {

            } 
        });
    }, [store]);

    // Subscribe to changes in openProjectId
    React.useEffect(() => {
        return store.subscribe(s=>s.openProjectId, (openedId, prevOpenedId) => {
            if(openedId === prevOpenedId) return;
            if(openedId !== null && prevOpenedId !== null) {
                // Replace history
            } else {
                // Push history
            }
        });
    }, [store]);

    


    // Add browser navigation handling
    React.useEffect(() => {
        const listener = (ev: PopStateEvent) => {
        };
        window.addEventListener('popstate', listener, {});
        return () => window.removeEventListener('popstate', listener, {});
    });

    
    return <>
        {children}
    </>;
}

export function BrowserStoreProvider({children, scrollTo, showToast, ...props}: BrowserStoreProviderProps) {
    const storeRef = React.useRef<BrowserStore>(null);
      if (!storeRef.current) {
        const newStore = createBrowserStore(props);
        storeRef.current = newStore;
      }
      return (
        <BrowserStoreContext value={storeRef.current}>
            <BrowserStoreContextInner store={storeRef.current} scrollTo={scrollTo} showToast={showToast} allProjects={props.allProjects}>
                {children}
            </BrowserStoreContextInner>
        </BrowserStoreContext>
      );
}

export function useBrowserContext<T>(
  selector: (state: BrowserStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const store = React.useContext(BrowserStoreContext);
  if (!store) throw new Error('Missing BrowserStoreContext.Provider in the tree');
  //   return useStoreWithEqualityFn(store, selector, equalityFn);
  return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}

type SetBrowserState = BrowserStore['setState'];

export const setBrowserContext: SetBrowserState = (
    partial, //: BrowserStoreState | Partial<BrowserStoreState> | ((state: BrowserStoreState) => BrowserStoreState | Partial<BrowserStoreState>),
    replace: boolean | undefined = false
): void => {
    const store = React.useContext(BrowserStoreContext);
    if (!store) throw new Error('Missing BrowserStoreContext.Provider in the tree');
    //   return useStoreWithEqualityFn(store, selector, equalityFn);
    if(replace) 
        store.setState(partial as BrowserStoreState | ((state: BrowserStoreState) => BrowserStoreState), replace);
    else
        store.setState(partial as Partial<BrowserStoreState> | ((state: BrowserStoreState) => Partial<BrowserStoreState>), replace);
    // return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}

// function test(partial: Partial<BrowserStoreState>, full: BrowserStoreState) {
//     setBrowserContext(partial, false);
//     setBrowserContext(full, true);
//     setBrowserContext(full, false);
// }

export function useFilterContext<T>(
    selector: (state: FilterStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean,
    // filterEqualityFn?: (left: FilterStore, right: FilterStore) => boolean,
): T {
    const filterStore = useBrowserContext(state=>state.filterStore);
    return useStoreWithEqualityFn(filterStore, selector, equalityFn);
}


