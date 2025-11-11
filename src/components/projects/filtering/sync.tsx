import { useEffect } from "react"
import { useFilter } from "./common/filterContext";
import { TAGTYPES, type FilterRangeInfo } from "./common/filterTypes";


export function simplifyYearRange(rangeInfo: FilterRangeInfo, minYear_: number | undefined, maxYear_: number | undefined): [number | undefined, number | undefined] | undefined {
    const minYear = (minYear_ === 0 || minYear_ === undefined || Number.isNaN(minYear_) || minYear_ <= rangeInfo.minYear) ? undefined : minYear_;
    const maxYear = (maxYear_ === 0 || maxYear_ === undefined || Number.isNaN(maxYear_) || maxYear_ >= rangeInfo.maxYear) ? undefined : maxYear_;
    return (minYear === undefined && maxYear === undefined) ? undefined : [minYear, maxYear];
}
export function FilterURLSync({rangeInfo}: {rangeInfo: FilterRangeInfo}) {
  const { state } = useFilter();

  useEffect(() => {
    const params = new URLSearchParams()
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

export function useInitializeFilterFromURL(rangeInfo: FilterRangeInfo) {
  const { dispatch } = useFilter()

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