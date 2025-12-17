import { createContext, useContext, useMemo, useReducer, type Dispatch, type SetStateAction } from 'react';
import { createFilterReducer, TAGTYPES, type FilterAction, type FilterRangeInfo, type FilterState, type TagType } from './filterTypes';
// import type { ProjectBrowserHandle } from '../../ProjectBrowserReact';

export type FilterContextValue = {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  carouselOpen: boolean;
  setCarouselOpen: Dispatch<SetStateAction<boolean>>;
  // browser: ProjectBrowserHandle | null
};



const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children, rangeInfo, carouselOpen, setCarouselOpen }: { children: React.ReactNode, rangeInfo: FilterRangeInfo, carouselOpen: boolean, setCarouselOpen: Dispatch<SetStateAction<boolean>> }) {
  const reducer = useMemo(() => createFilterReducer(rangeInfo), [rangeInfo]);

  const [state, dispatch] = useReducer(reducer, {
    year: undefined,
    categories: new Set<string>(),
    tags: (TAGTYPES.reduce((acc, t) => ({ ...acc, [t]: new Set() }), {}) as Record<TagType, Set<string>>),
  } as FilterState);

  return <FilterContext.Provider value={{ state, dispatch, carouselOpen, setCarouselOpen }}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used inside FilterProvider');
  return ctx;
}