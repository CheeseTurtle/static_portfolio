import { createStore } from "zustand";
// import { createWithEqualityFn } from "zustand/traditional";
import { subscribeWithSelector } from "zustand/middleware";
import {
  collectFilterRangeInfo,
  TAGTYPES,
  type FilterRangeInfo,
  type TagType,
} from "../filterTypes";
import type { ProjectInfo } from "@/components/projects/types";


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

export interface FilterDataProps {
  // bears: number,
  year: [number | null, number | null] | null; // min and max
  categories: Set<string>; // selected categories
  tags: Record<TagType, Set<string>> | null; // selected tags by type
  // openProjectId?: string | null;
  // urlProjectId?: string | null;
  // _urlReplace?: boolean;
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
};


export interface FilterStoreActions {
  setYear: (
    value: [number | null, number | null] | null,
  ) => void;
  toggleCategory: (value: string, active?: boolean) => void;
  toggleTag: (tagType: TagType, tagText: string, active?: boolean) => void;
  setFilter: (spec: Partial<SetFilterProps>) => void;
  resetFilter: (payload?: ResetPayload) => void;
}

export interface FilterStoreState extends FilterStoreProps, FilterStoreActions {
  // addBear: () => void
}

export type FilterStore = ReturnType<typeof createFilterStore>;

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
  };

  const rangeInfo = filterRangeInfo ?? collectFilterRangeInfo(initProps.allProjects);
  return createStore<FilterStoreState>()(subscribeWithSelector((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    filterRangeInfo: rangeInfo,

    // addBear: () => set((state) => ({ bears: ++state.bears })),

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

    toggleTag: (tagType, tagText, active) =>
      set((state) => {
        // const tags = { ...state.tags, [tagType]: new Set(state.tags?.[tagType] ?? []) };
        const tags = state.tags;
        const tagSet = tags?.[tagType];
        if (tagSet !== undefined && tagSet.has(tagText)) {
          if (active === true) return {};
          tagSet.delete(tagText);
        } else if (active === false) return {};
        else if(tags === null)
          return {tags: {
              lang: new Set<string>([]),
              skill: new Set<string>([]),
              topic: new Set<string>([]),
              [tagType]: new Set<string>([tagText])}};
        else if(tagSet === undefined)
          tags[tagType] = new Set<string>([tagText]);
        else tagSet.add(tagText);
        
        return { tags };
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
