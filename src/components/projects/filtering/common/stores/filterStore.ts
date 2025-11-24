import { createStore } from "zustand";
// import { createWithEqualityFn } from "zustand/traditional";
import { subscribeWithSelector } from "zustand/middleware";
import {
  collectFilterRangeInfo,
  getProjectKeyFromTagType,
  TAGTYPES,
  type FilterRangeInfo,
  type TagType,
} from "../filterTypes";
import type { ProjectInfo, TagKey } from "@/components/projects/types";
import { Value } from "@radix-ui/react-select";


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
  // bears: number,
  year: [number | null, number | null] | null; // min and max
  categories: Set<string>; // selected categories
  tags: Record<TagType, Set<string>> | null; // selected tags by type
  // openProjectId?: string | null;
  // urlProjectId?: string | null;
  // _urlReplace?: boolean;
  tagModes: Record<TagType, TagFilterMode>;
}

export interface FilterStoreProps extends FilterInitProps, FilterDataProps {
  filterRangeInfo: FilterRangeInfo;
}

export type SetFilterProps = {
  year?: [number | null, number | null] | null; // min and max
  category?: string[] | Set<string>; // selected categories
  // tags?: Record<TagType, Set<string>>; // selected tags by type
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
  // canSetFilter: (spec: Partial<SetFilterProps>) => boolean;
  canToggleCategory: (value: string, currentlyActive: boolean ) => boolean,
  canToggleTag: (tagType: TagKey, tagText: string, currentlyActive: boolean, visibleProjects: ProjectInfo[], ) => boolean,
  resetFilter: (payload?: ResetPayload) => void;

  applyFilter: (spec: Partial<FilterDataProps>, projects: ProjectInfo[]) => ProjectInfo[], 
  canApplyFilter: (spec: Partial<FilterDataProps>, projects: ProjectInfo[]) => boolean, 
}

export interface FilterStoreState extends FilterStoreProps, FilterStoreActions {
  // addBear: () => void
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
      if(Object.entries(spec.tags).some(([tagType, specTags]) => specTags?.size && 
      (tagKey = getProjectKeyFromTagType(tagType as TagType)) &&
      (
        tagModes[tagType as TagType] 
        ?
        // (not) BOOLEAN AND: specTags contains at least one tag that is not found in p.tags
        [...specTags].some(specTag=>!(p.tags[tagKey]).has(specTag))
        :
        // (not) BOOLEAN OR: No tags are common to specTags and p.tags.
        ![...p.tags[tagKey]].some(pTag=>specTags.has(pTag))
      )))
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
      if(Object.entries(spec.tags).some(([tagType, tags]) => tags?.size && [...tags].some(tag=>!((p.tags as Record<TagKey, Set<string>>)[(tagType as TagKey)] as Set<string>).has(tag))))
        return false;
    }
    return true;
  });
}

export const createFilterStore = (
  {filterRangeInfo, ...initProps}: FilterInitProps & Partial<FilterDataProps> & { filterRangeInfo?: FilterRangeInfo },
) => {
  // export const createFilterStore = (initProps?: Partial<FilterProps>) => {
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
  return createStore<FilterStoreState>()(subscribeWithSelector((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    filterRangeInfo: rangeInfo,

    // addBear: () => set((state) => ({ bears: ++state.bears })),

    setTagMode(tagType, mode) {
      console.log(`Setting ${tagType} mode to:`, mode);
      set({tagModes: {...get().tagModes, [tagType]: mode}});
    },
    setYear: (value) =>
      set((state) => {
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
      // return projects.filter(p=>{
      //   if(spec.year && (spec.year[0] !== null || spec.year[1] !== null)) {
      //     const year = p.date.getFullYear();
      //     const [minYear, maxYear] = spec.year;
      //     if((minYear !== null && year < minYear) || (maxYear !== null && year > maxYear)) return false;
      //   }
      //   if(spec.categories?.size && !spec.categories.has(p.category)) return false;
      //   if(spec.tags) {
      //     if(Object.entries(spec.tags).some(([tagType, tags]) => tags?.size && [...tags].some(tag=>!((p.tags as Record<TagKey, Set<string>>)[(tagType as TagKey)] as Set<string>).has(tag))))
      //       return false;
      //   }
      //   return true;
      // });
    },

    canApplyFilter(spec, projects): boolean {
      return projects.some(p=>{
        if(spec.year && (spec.year[0] !== null || spec.year[1] !== null)) {
          const year = p.date.getFullYear();
          const [minYear, maxYear] = spec.year;
          if((minYear !== null && year < minYear) || (maxYear !== null && year > maxYear)) return false;
        }
        if(spec.categories?.size && !spec.categories.has(p.category)) return false;
        if(spec.tags) {
          if(Object.entries(spec.tags).some(([tagType, tags]) => tags?.size && [...tags].some(tag=>!((p.tags as Record<TagKey, Set<string> | undefined>)[(tagType as TagKey)] as Set<string> | undefined)?.has(tag))))
            return false;
        }
        return true;
      });
    },
    
    canToggleCategory(value, currentlyActive): boolean {
      if(currentlyActive) return true; // Can always unselect
      const tags = get().tags;
      const year = get().year;
      const ret = get().canApplyFilter({
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
        let newTagSet = new Set<string>(tagSet);
        if (tagSet !== undefined && tagSet.has(tagText)) {
          if (active === true) return {};
          newTagSet.delete(tagText);
        } else if (active === false) return {};
        // else if(tags === null)
        //   return {tags: {
        //       lang: new Set<string>([]),
        //       skill: new Set<string>([]),
        //       topic: new Set<string>([]),
        //       [tagType]: new Set<string>([tagText])}};
        // // else if(tagSet === undefined)
        // //   tags[tagType] = new Set<string>([tagText]);
        else newTagSet.add(tagText);

        console.log(`Setting ${tagType} tags to:`, newTagSet);
        
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
            // : {
            //     lang:
            //       lang === undefined ? state.tags?.lang ?? null : new Set<string>(lang),
            //     skill:
            //       skill === undefined
            //         ? state.tags?.skill
            //         : new Set<string>(skill),
            //     topic:
            //       topic === undefined
            //         ? state.tags?.topic
            //         : new Set<string>(topic),
            //   };
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
    resetFilter: (payload?) =>
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
      }, true),
  })));
};
