import type { ProjectInfo } from "@/components/projects/types";
import { subscribeWithSelector } from "zustand/middleware";
import { createFilterStore, type FilterDataProps, type FilterStore, type FilterStoreActions, type FilterStoreProps, type FilterStoreState, type SetFilterProps } from "./filterStore";
import { collectFilterRangeInfo, getProjectKeyFromTagType, TAGTYPES, type FilterRangeInfo } from "../filterTypes";
import { createStore, useStore, create } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import React, { createContext, useContext, useRef } from "react";

import {shallow} from "zustand/shallow";


type StoreInitializerFn<T> = Parameters<ReturnType<typeof createStore<T>>>[0];
type ExtendedStoreInitializerFn<T,P=any> = (...p: [...Parameters<StoreInitializerFn<T>>, ...P[]]) => ReturnType<StoreInitializerFn<T>>;


export function findNewIndex(ids: Iterable<string>, id: string): number | null {
    let index = 0;
    for(const projectId of ids) {
        if(id == projectId) return index;
        index++;
    }
    return null;
}


export interface BrowserStoreInitProps {
  allProjects: ProjectInfo[];
  filterRangeInfo?: FilterRangeInfo;
//   scrollTo: ScrollToFn,
//   showToast: ShowToastFn
}

interface UISliceProps {
  // UI
  activeProjectIndex: number | null;
  openProjectId: string | null;
  carouselOpen: boolean;
  sheetOpen: boolean;
  urlProjectId: string | null;
}

interface UISliceActions {
    setActiveProjectIndex: (index: number) => void,
    setCarouselOpen: (open: boolean) => void,
    setSheetOpen: (open: boolean) => void,
    setOpenProjectId: (id: string | null) => void,
}

export interface UISliceState extends UISliceActions, UISliceProps {}


const createUISlice: StoreInitializerFn<UISliceState> = (set, get): UISliceState => ({
  activeProjectIndex: null,
  carouselOpen: false,
  sheetOpen: false,
  openProjectId: null,
  urlProjectId: null,

  setActiveProjectIndex: (i) => set((state: UISliceState) => {
    // If visibleProjects changes later, computed will correct it
    return { activeProjectIndex: i };
  }),
  setCarouselOpen: (open) => set({ carouselOpen: open }),
  setSheetOpen: (open) => set({ sheetOpen: open }),
  setOpenProjectId: (id) => set({ openProjectId: id }),
});



//   // Filter
//   year: [number | undefined, number | undefined] | undefined;
//   categories: Set<string>;
//   tags: Record<TagType, Set<string>>;

interface ComputedSliceProps {
    // filterStore: FilterStore,

    // Computed

    visibleProjects: Map<string, ProjectInfo>,  // Record<string, ProjectInfo> | {[id: string]: ProjectInfo},
    activeProjectId: string | null,

    get visibleProjectIds(): Set<string>,

    // get visibleProjects(): ProjectInfo[];
    // get activeProjectId(): string | null;
}


interface ComputedSliceActions {
    filterProjects: (props: FilterDataProps) => (ProjectInfo[] | null),
    getIndexForId: (id: string) => number | null,
    getIdForIndex: (index: number) => string | null,
}

export interface ComputedSliceState extends ComputedSliceProps, ComputedSliceActions {}


const createComputedSlice: ExtendedStoreInitializerFn<ComputedSliceState> = (_set, get, _api, allProjects: ProjectInfo[]): ComputedSliceState => ({
    visibleProjects: new Map<string, ProjectInfo>(allProjects.map(p=>[p.id, p])),
    activeProjectId: null,

    get visibleProjectIds() {
        const {visibleProjects} = get();
        return new Set<string>(Object.keys(visibleProjects));
        // return new Set<string>(visibleProjects.map(x=>x.id));
    },

    filterProjects: ({year, categories, tags}: FilterDataProps) => {
        // const {year} = useStore(filterStore);
        // const {categories} = useStoreWithEqualityFn(filterStore);
        // const {tags} = useStoreWithEqualityFn(filterStore);

        const {visibleProjectIds} = get();

        let anyChange: boolean = false;

        const filteredProjects = allProjects.filter(p => {
            const matches = (()=>{ // TODO: Move outside slice

                let match = true;
                const pYear = p.date.getFullYear();
                if (year && year[0] !== null) match &&= pYear >= year[0];
                if (year && year[1] !== null) match &&= pYear <= year[1];

                if(!match) return false;

                if (categories.size) match &&= categories.has(p.category);

                if(!match) return false;

                for (const t of TAGTYPES) {
                    const k = getProjectKeyFromTagType(t);
                    if (tags[t].size && ![...tags[t]].some(tag => p.tags[k]?.has(tag))) 
                        return false;
                }
                return true;
            })();
            anyChange ||= (matches !== visibleProjectIds.has(p.id));
            return matches;
        });
        return anyChange ? filteredProjects : null;
    },

    getIdForIndex: (index: number): string | null => {
        const {visibleProjects} = get();
        if(0 > index || index >= visibleProjects.size)
            return null; // Invalid index!

        const it = visibleProjects.keys();
        let i: number = 0;
        do {
            const {value, done} = it.next();
            if(done || (i == index))
                return value ?? null;
            i++;
        } while(i <= index);
        return null;
    },

    getIndexForId: (id: string): number | null =>  {
        const {visibleProjectIds} = get();
        return findNewIndex(visibleProjectIds, id);
    },

//   get activeProjectId() {
//     const idx = get().activeProjectIndex;
//     const vp = get().visibleProjects;
//     if (idx !== null && vp[idx]) return vp[idx].id;

//     // If index is invalid, try to keep the previously active project
//     return null;
//   }
});


interface BrowserStoreProps extends BrowserStoreInitProps, UISliceProps, ComputedSliceProps {
    filterRangeInfo: FilterRangeInfo;
    filterStore: FilterStore,
}

interface BrowserStoreActions extends UISliceActions, ComputedSliceActions {
    // Actions
    setActiveProjectIndex: (idx: number | null) => void;
    // setFilter: (spec: Partial<SetFilterProps>) => void;
    
}

export interface BrowserStoreState extends BrowserStoreProps, BrowserStoreActions {}

export type BrowserStore = ReturnType<typeof createBrowserStore>;



export const createBrowserStore = ({allProjects, filterRangeInfo}: BrowserStoreInitProps) => createStore<BrowserStoreState>()(subscribeWithSelector((set,get,api) => {
    filterRangeInfo ??= collectFilterRangeInfo(allProjects);

    const computedSlice =  createComputedSlice(set, get, api, allProjects);
    const uiSlice = createUISlice(set, get, api);
    
    const filterStore = createFilterStore({filterRangeInfo, allProjects});

    // Subscribe to changes in active index

    return {
        allProjects, filterRangeInfo,
        ...computedSlice, ...uiSlice,
        filterStore,

        setActiveProjectIndex(index: number | null) { 
            const {activeProjectIndex, getIdForIndex} = get();
            if(index === activeProjectIndex) return;
            if(index !== null && index !== undefined) {
                const newId = getIdForIndex(index);
                if(newId !== null) {
                    set({
                        activeProjectIndex: index,
                        activeProjectId: newId
                    });
                    return;
                }
            }
            set({activeProjectIndex: null, activeProjectId: null});
        },
    }
    
}));



