import { createStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  collectFilterRangeInfo,
  getProjectKeyFromTagType,
  TAGTYPES,
  type FilterRangeInfo,
  type TagType,
} from "../filterTypes";
import type { ProjectInfo, TagKey } from "@/components/projects/types";
// import { compareYearRanges, isEquivalentOptionalSet, isEquivalentTagsFilter } from "@/components/projects/util/comparison";

export enum FilterField {
  MIN_YEAR = 1,
  MAX_YEAR = 2,
  ALL_YEAR = 3,

  CATEGORY = 4,
  TAG = 8,
}

type ResetPayload = {
  mask?: FilterField;
  tagTypes?: TagType[] | TagType;
};

export interface FilterInitProps {
  allProjects: ProjectInfo[];
}

export enum TagFilterMode {
  AND = 0,
  OR = 1
}

export interface FilterDataProps {
  year: [number | null, number | null] | null; // min and max
  categories: Set<string>; // selected categories
  tags: Record<TagType, Set<string>> | null; // selected tags by type
  tagModes: Record<TagType, TagFilterMode>;
}

export interface FilterStoreProps extends FilterInitProps, FilterDataProps {
  filterRangeInfo: FilterRangeInfo;
  // isPassThru: boolean,
}

export type SetFilterProps = {
  year?: [number | null, number | null] | null; // min and max
  category?: string[] | Set<string>; // selected categories
  lang?: string[] | Set<string>;
  skill?: string[] | Set<string>;
  topic?: string[] | Set<string>;
  tagModes?: Partial<Record<TagType, TagFilterMode>>;
};


export interface FilterStoreActions {
  setYear: (
    value: [number | null, number | null] | null,
  ) => void;
  toggleCategory: (value: string, active?: boolean) => void;

  setCategories: (value: string[]) => void;

  toggleTag: (tagType: TagType, tagText: string, active?: boolean) => void;
  setFilter: (spec: Partial<SetFilterProps>) => void;

  setTagMode: (tagType: TagType, mode: TagFilterMode) => void,
  canToggleCategory: (value: string, currentlyActive: boolean ) => boolean,
  canToggleTag: (tagType: TagKey, tagText: string, currentlyActive: boolean, visibleProjects: ProjectInfo[], ) => boolean,
  resetFilter: (payload?: ResetPayload) => void;
  resetYear: (resetMin?: boolean, resetMax?: boolean) => void,
  resetCategories: () => void,
  resetTags: (tagType?: TagType | TagType[]) => void,

  applyFilter: (spec: Partial<FilterDataProps>, projects: ProjectInfo[]) => ProjectInfo[], 
  canApplyFilter: (spec: Partial<FilterDataProps>, projects: ProjectInfo[]) => boolean, 
}

export interface FilterStoreState extends FilterStoreProps, FilterStoreActions {
}

export type FilterStore = ReturnType<typeof createFilterStore>;

export function applyFilter({tagModes, ...spec}: Partial<Omit<FilterDataProps, "tags">>, projects: ProjectInfo[]): ProjectInfo[];
export function applyFilter({tagModes, ...spec}: Partial<FilterDataProps> & Pick<FilterDataProps, 'tagModes'>, projects: ProjectInfo[]): ProjectInfo[];
export function applyFilter({tagModes, ...spec}: Partial<FilterDataProps>, projects: ProjectInfo[]): ProjectInfo[] {
  const filtered = projects.filter(p=>{
    if(spec.year && (spec.year[0] !== null || spec.year[1] !== null)) {
      const year = p.date.getFullYear();
      const [minYear, maxYear] = spec.year;
      if((minYear !== null && year < minYear) || (maxYear !== null && year > maxYear)) return false;
    }
    if(spec.categories?.size && !spec.categories.has(p.category)) return false;
    if(spec.tags) {
      if(!tagModes) throw TypeError(tagModes);
      let tagKey: TagKey;
      

      // TODO
      if(Object.entries(spec.tags).some(([tagType, specTags]) => specTags?.size && 
      (tagKey = getProjectKeyFromTagType(tagType as TagType)) && (!p.tags[tagKey] ||
      (
        tagModes[tagType as TagType] 
        ?
        // (not) BOOLEAN AND: specTags contains at least one tag that is not found in p.tags
        [...specTags].some(specTag=>!(p.tags[tagKey]).has(specTag))
        :
        // (not) BOOLEAN OR: No tags are common to specTags and p.tags.
        ![...p.tags[tagKey]].some(pTag=>specTags.has(pTag))
      ))))
        return false;
    }
    return true;
  });
  return filtered;
}

export function canApplyFilter(spec: Partial<FilterDataProps> & Pick<FilterDataProps, 'tagModes'>, projects: ProjectInfo[]): boolean {
  return projects.some(p=>{
    if(spec.year && (spec.year[0] !== null || spec.year[1] !== null)) {
      const year = p.date.getFullYear();
      const [minYear, maxYear] = spec.year;
      if((minYear !== null && year < minYear) || (maxYear !== null && year > maxYear)) return false;
    }
    if(spec.categories?.size && !spec.categories.has(p.category)) return false;
    if(spec.tags) {
      if(Object.entries(spec.tags).some(([tagType, tags]) => tags?.size && [...tags].some(tag=>!((p.tags)[(tagType as TagKey)]).has(tag))))
        return false;
    }
    return true;
  });
}


export function isPassThruTagsFilter(tags: FilterDataProps['tags']): boolean {
  return !(tags && Object.values(tags).some(x=>x.size))
}

export function isPassThruYearFilter(year: FilterDataProps['year'], rangeInfo: FilterRangeInfo): boolean {
  if(year) {
    if(year[0] && year[0] !== rangeInfo.minYear) return false;
    if(year[1] && year[1] !== rangeInfo.maxYear) return false;
  }
  return true;
}

export function isPassThruCategoryFilter(categories: FilterDataProps['categories']): boolean {
  return !!categories?.size;
}

export function isPassThruFilter(spec: Partial<FilterDataProps>, rangeInfo: FilterRangeInfo): boolean {
  if(spec.year) {
    if(spec.year[0] && spec.year[0] !== rangeInfo.minYear) return false;
    if(spec.year[1] && spec.year[1] !== rangeInfo.maxYear) return false;
  }

  if(spec.categories?.size)
    return false;

  if(spec.tags && Object.values(spec.tags).some(x=>x.size))
      return false;

  return true;
}

export const createFilterStore = (
  {filterRangeInfo, ...initProps}: FilterInitProps & Partial<FilterDataProps> & { filterRangeInfo?: FilterRangeInfo },
) => {
  const DEFAULT_PROPS: FilterDataProps = {
    year: null,
    categories: new Set<string>(),
    tags: {
      lang: new Set<string>(),
      skill: new Set<string>(),
      topic: new Set<string>(),
    },
    tagModes: {
      lang: TagFilterMode.AND,
      skill: TagFilterMode.AND,
      topic: TagFilterMode.AND,
    }
  };

  const rangeInfo = filterRangeInfo ?? collectFilterRangeInfo(initProps.allProjects);
  const store = createStore<FilterStoreState>()(subscribeWithSelector((set, get, _api) => {

    
  const resetFilter: FilterStoreState['resetFilter'] = (payload?) =>
        set((state) => {
          if (payload && payload.mask !== undefined) {
            const year: [number | null, number | null] | null =
              payload.mask & FilterField.ALL_YEAR && state.year !== null
                ? [
                    payload.mask & FilterField.MIN_YEAR
                      ? rangeInfo.minYear
                      : state.year[0],
                    payload.mask & FilterField.MAX_YEAR
                      ? rangeInfo.maxYear
                      : state.year[1],
                  ] // as [number, number] | [number, undefined] | [undefined, number]
                : (state.year ?? null);
            const categories =
              payload.mask & FilterField.CATEGORY
                ? new Set<string>()
                : state.categories;

            const tagTypes = payload.tagTypes;
            const tags =
              payload.mask & FilterField.TAG
                ? tagTypes === undefined
                  ? TAGTYPES.reduce((acc, t) => ({ ...acc, [t]: new Set() }), {})
                  : Array.isArray(tagTypes)
                    ? TAGTYPES.reduce(
                        (acc, t) => ({
                          ...acc,
                          [t]: tagTypes.includes(t)
                            ? new Set<string>()
                            : state.tags?.[t],
                        }),
                        {},
                      )
                    : TAGTYPES.reduce(
                        (acc, t) => ({
                          ...acc,
                          [t]: t === tagTypes ? new Set() : state.tags?.[t],
                        }),
                        {},
                      )
                : state.tags;
            return { ...state, year, categories, tags: <Record<TagType, Set<string>>>tags };
          }
          return {
            ...state,
            year: null,
            categories: new Set<string>(),
            tags: <Record<TagType, Set<string>>>(
              TAGTYPES.reduce((acc, t) => ({ ...acc, [t]: new Set() }), {})
            ),
          };
        }, true);


    const canApplyFilter: FilterStoreState['canApplyFilter'] = (spec, projects): boolean => {
      return projects.some(p=>{
        if(spec.year && (spec.year[0] !== null || spec.year[1] !== null)) {
          const year = p.date.getFullYear();
          const [minYear, maxYear] = spec.year;
          if((minYear !== null && year < minYear) || (maxYear !== null && year > maxYear)) return false;
        }
        if(spec.categories?.size && !spec.categories.has(p.category)) return false;
        if(spec.tags) {
          if(Object.entries(spec.tags).some(([tagType, tags]) => tags?.size && [...tags].some(tag=>!((p.tags as Record<TagKey, Set<string> | undefined>)[(tagType as TagKey)])?.has(tag))))
            return false;
        }
        return true;
      });
    }

    const initDataProps = {
      ...DEFAULT_PROPS,
      ...initProps,
    }

    return {
      ...initDataProps,

      filterRangeInfo: rangeInfo,
      // isPassThru: isPassThruFilter(initDataProps, rangeInfo),

      toggleCategory: (value, active) =>
        set((state) => {
          // const categories = new Set(state.categories);
          if (state.categories !== null && state.categories.has(value)) {
            if (active === true) return {};
            state.categories.delete(value);
          } else if (active === false) return {};
          else if(state.categories === null)
            return { categories: new Set<string>([value]) };
          else state.categories.add(value);
          return { categories: new Set<string>(state.categories) };
      }),

      applyFilter(spec, projects): ProjectInfo[] {
        return applyFilter(
          {
            tagModes: get().tagModes,
            ...spec
          }, projects
        );
      },

      canApplyFilter,
      
      canToggleCategory(value, currentlyActive): boolean {
        if(currentlyActive) return true; // Can always unselect
        const tags = get().tags;
        const year = get().year;
        const ret = canApplyFilter({
          year, tags, categories: new Set([value])
        }, initProps.allProjects);

        return ret;
      },

      canToggleTag(tagKey, tagText, currentlyActive, visibleProjects): boolean {
        if(currentlyActive) return true; // Can always unselect
        const ret = visibleProjects.some(p=>{
          const tags = p.tags[tagKey];
          return (tags.size && tags.has(tagText));
        });
        // console.log('Can toggle tag?:', tagKey, tagText, ret);
        return ret;
      },


      toggleTag: (tagType, tagText, active) =>
        set((state) => {
          // const tags = { ...state.tags, [tagType]: new Set(state.tags?.[tagType] ?? []) };
          const tags = state.tags;
          const tagSet = tags?.[tagType];
          const newTagSet = new Set<string>(tagSet);
          if (tagSet !== undefined && tagSet.has(tagText)) {
            if (active === true) return {};
            newTagSet.delete(tagText);
          } else if (active === false) return {};
          else newTagSet.add(tagText);

          return { tags: {...(tags ?? {lang: new Set(), skill: new Set(), topic: new Set()}), [tagType]: newTagSet } };
        }),

      setFilter: ({
        category,
        year,
        lang,
        skill,
        topic,
      }: Partial<SetFilterProps>) =>
        set((state) => {
          const newTags =
            lang === undefined && skill === undefined && topic === undefined
              ? undefined
              : (()=>{
                  const ret: Partial<Record<TagType, Set<string>>> = {};
                  if(lang !== undefined)
                    ret.lang = new Set<string>(lang);
                  if(skill !== undefined)
                    ret.skill = new Set<string>(skill);
                  if(topic !== undefined)
                    ret.topic = new Set<string>(topic);
                  return {...(state.tags ?? {lang: new Set<string>([]), skill: new Set<string>([]), topic: new Set<string>([])}), ...ret};
              })();
          const newState = {
            categories:
              category === undefined
                ? state.categories
                : new Set<string>(category),
            year: year === undefined ? (state.year ?? null) : (year ?? null),
            tags: newTags ?? null,
          };
          console.log("[createStore] INIT_FROM_URL new state:", newState);
          return {...state, ...newState};
        }, true),
      resetFilter,
      resetYear: (resetMin: boolean = true, resetMax: boolean = true)=>{
        const mask = (resetMin ? (resetMax ? FilterField.ALL_YEAR : FilterField.MIN_YEAR) : (resetMax ? FilterField.MAX_YEAR : null));
        if (mask !== null) resetFilter({mask});
      },
      resetCategories: ()=>resetFilter({mask: FilterField.CATEGORY}),
      resetTags: (tagTypes?: TagType | TagType[]) => resetFilter({mask: FilterField.TAG, tagTypes}),

      // get isPassThru() {

      //   return isPassThruFilter(get(), rangeInfo)
      // },

       setTagMode(tagType, mode) {
          // console.log(`Setting ${tagType} mode to:`, mode);
          set(({tagModes})=>({tagModes: {...tagModes, [tagType]: mode}}));
        },
        
        setYear: (value) =>
          set((_state) => {
            if (value === undefined) return {};
            if (value === null) return { year: null };
            const minYear =
              value[0] !== null && value[0] > rangeInfo.minYear
                ? value[0]
                : null;
            const maxYear =
              value[1] !== null && value[1] < rangeInfo.maxYear
                ? value[1]
                : null;
            
            return {
              year:
                minYear === null && maxYear === null
                  ? null
                  : [minYear, maxYear],
            };
          }),
  
        setCategories: (value: string[]) => set(state=>{
          const oldSize = state.categories.size;
          const newSize = value.length;
          if(newSize === oldSize && value.every(x=>state.categories.has(x))) return {}; // No change
          const newCategories = new Set<string>(value);
          return {categories: newCategories};
        }),
    }
  }));

  // store.subscribe(s=>s.tags, (tags)=>{
  //   const isNullTags = isPassThruTagsFilter(tags);
  //   const wasPassThru = store.getState().isPassThru;
  //   if(!isNullTags) {
  //     if(wasPassThru) store.setState({isPassThru: false})
  //     return;
  //   } else if(wasPassThru)
  //     return; // This shouldn't happen

  //   // Handle the case when tags becomes null but some other filter aspect remains in effect
  //   store.setState((state)=>{
  //     const isPassThru = isPassThruCategoryFilter(state.categories) && isPassThruYearFilter((state.year), rangeInfo);
  //     return (isPassThru ? {...state, isPassThru} : state)
  //   }, true)
  // }, {equalityFn: isEquivalentTagsFilter})

  // store.subscribe(s=>s.year, (year)=>{
  //   const isNullTags = isPassThruYearFilter(year, rangeInfo);
  //   const wasPassThru = store.getState().isPassThru;
  //   if(!isNullTags) {
  //     if(wasPassThru) store.setState({isPassThru: false})
  //     return;
  //   } else if(wasPassThru)
  //     return; // This shouldn't happen

  //   // Handle the case when tags becomes null but some other filter aspect remains in effect
  //   store.setState((state)=>{
  //     const isPassThru = isPassThruCategoryFilter(state.categories) && isPassThruTagsFilter((state.tags));
  //     return (isPassThru ? {...state, isPassThru} : state)
  //   }, true)
  // }, {equalityFn: (a,b) => compareYearRanges(rangeInfo.minYear, rangeInfo.maxYear, a, b)})


  // store.subscribe(s=>s.categories, (categories)=>{
  //   const isNullTags = isPassThruCategoryFilter(categories);
  //   const wasPassThru = store.getState().isPassThru;
  //   if(!isNullTags) {
  //     if(wasPassThru) store.setState({isPassThru: false})
  //     return;
  //   } else if(wasPassThru)
  //     return; // This shouldn't happen

  //   // Handle the case when tags becomes null but some other filter aspect remains in effect
  //   store.setState((state)=>{
  //     const isPassThru = isPassThruYearFilter(state.year, rangeInfo) && isPassThruTagsFilter((state.tags));
  //     return (isPassThru ? {...state, isPassThru} : state)
  //   }, true)
  // }, {equalityFn: isEquivalentOptionalSet})


  return store;
};


