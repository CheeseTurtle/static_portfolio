import { useEffect, useRef } from "react"
import { useFilter } from "./common/filterContext";
import { TAGTYPES, type FilterRangeInfo, type FilterState, type InitFromURL } from "./common/filterTypes";


export function simplifyYearRange(rangeInfo: FilterRangeInfo, minYear_: number | undefined, maxYear_: number | undefined): [number | undefined, number | undefined] | undefined {
    const minYear = (minYear_ === 0 || minYear_ === undefined || Number.isNaN(minYear_) || minYear_ <= rangeInfo.minYear) ? undefined : minYear_;
    const maxYear = (maxYear_ === 0 || maxYear_ === undefined || Number.isNaN(maxYear_) || maxYear_ >= rangeInfo.maxYear) ? undefined : maxYear_;
    return (minYear === undefined && maxYear === undefined) ? undefined : [minYear, maxYear];
}

export function FilterURLSync({rangeInfo}: {rangeInfo: FilterRangeInfo}) {
  const { state } = useFilter();

  useEffect(() => {
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

export function parseURL(rangeInfo: FilterRangeInfo, url: string): [InitFromURL, string | null]  {
  const params = new URLSearchParams(url);
  const category = params.get("category")?.split(",") ?? undefined
    const lang = params.get("lang")?.split(",") ?? undefined
    const skill = params.get("skill")?.split(",") ?? undefined
    const topic = params.get("topic")?.split(",") ?? undefined

    const yearParam = params.get("year");
    const [minYear_, maxYear_] = (yearParam === undefined || yearParam?.length === 0) ? [undefined, undefined] : (yearParam ?? "-").split("-").map(Number);
    
    const project: string | null = params.get('project') ?? null;

    return [{
      category, lang, skill, topic, year: simplifyYearRange(rangeInfo, minYear_, maxYear_),
    }, project];
}



export function useInitializeFromURL(rangeInfo: FilterRangeInfo) {
  const { dispatch, carouselOpen, setCarouselOpen, browser } = useFilter();
  const hasInitialized = useRef<boolean>(false);


  console.log('[useInitializeFromURL] Render', {
    hasInitialized: hasInitialized.current,
    search: window.location.search
  });

  useEffect(() => {
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


    console.log('[useInitializeFromURL] Parsing URL:', window.location.search);
    
    const [parsed, project] = parseURL(rangeInfo, window.location.search);

    // Apply filter state
    dispatch({
      type: "INIT_FROM_URL",
      payload: {...parsed, project}
    });

    console.log('[useInitializeFromURL] Dispatched INIT_FROM_URL', {...parsed, project});

    // console.log('browser:', browser);

    // if(project) {
    //   setCarouselOpen(true);
    // }


    // browser?.setOpenProjectFromId(project);
  }, [dispatch, rangeInfo]);
}


export function ProjectURLSync() {
  const { state } = useFilter();
  const hasInitialized = useRef(false);

  console.log('[ProjectURLSync]', window.location.href, window.location.search, state);


  useEffect(() => {
    // if (state.openProjectId === undefined) return;
    if (!hasInitialized.current) {
      console.log('[ProjectURLSync] First run, skipping to preserve initial URL');
      hasInitialized.current = true;
      return;
    }

    console.log('[ProjectURLSync] Effect running (after initialization)', {
      openProjectId: state.openProjectId,
      url: window.location.href
    });
    const params = new URLSearchParams(window.location.search);
    const oldProject = params.get('project');
    const replace = !!!oldProject === !!!state.openProjectId;
    if(oldProject != null || (state.openProjectId != null && state.openProjectId !== undefined))
      if(state._urlReplace !== undefined) console.assert(replace === state._urlReplace, `${replace} !== ${state._urlReplace} (${oldProject}, ${state.openProjectId})`);


    if (state.openProjectId) {
      // if(oldProject === state.openProjectId) return;
      params.set('project', state.openProjectId);
    // } else if(params.get('project') === undefined) {
    //   return;
    } else {
      params.delete('project');
    }


    const query = params.toString();
    const newUrl = query ? `?${query}` : window.location.pathname;

    
    if (newUrl === window.location.href) return;
    console.assert(oldProject != null || (state.openProjectId != null && state.openProjectId !== undefined));
    
    
    const method = replace ? 'replaceState' : 'pushState';

    // Use replaceState to avoid polluting history with intermediate project changes
    window.history[method](null, "", newUrl);
  }, [state.openProjectId]);

  return null;
}




export function useInitializeFilterFromURL(rangeInfo: FilterRangeInfo) {
  const { dispatch, carouselOpen, setCarouselOpen } = useFilter()

  useEffect(() => {
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
  }, [dispatch])
}