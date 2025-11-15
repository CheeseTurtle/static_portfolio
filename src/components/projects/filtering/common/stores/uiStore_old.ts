import type { ProjectInfo } from "@/components/projects/types";
import { createFilterStore, type FilterStore, type FilterStoreState } from "./filterStore";
import { collectFilterRangeInfo, type FilterRangeInfo } from "../filterTypes";
import { createStore, useStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { createContext, useContext, useRef } from "react";



// allProjects: ProjectInfo[],


interface UIStoreProps {
    activeProjectIndex: number | null,
    openProjectId: string | null,
    carouselOpen: boolean,
    sheetOpen: boolean,
    urlProjectId: string | null,
    _urlReplace?: boolean | undefined    
};

interface UIStoreState extends UIStoreProps {

}

export type UIStore = ReturnType<typeof createUIStore>;

const createUIStore = () => createStore<UIStoreState>(
    (set, get, api) => {
        const DEFAULT_PROPS: UIStoreProps = {
            activeProjectIndex: null,
            openProjectId: null,
            carouselOpen: false,
            sheetOpen: false,
            urlProjectId: null,
            _urlReplace: undefined
        };

        return {
            ...DEFAULT_PROPS,
            
        };
    }
);





export type ComputedStore = ReturnType<typeof createComputedStore>;


interface ComputedStoreInitProps {
    allProjects: ProjectInfo[],
}

interface ComputedStoreProps {
    visibleProjects: ProjectInfo[], // Computed from `allProjects` and the filter state
    activeProjectId: string | null,  // Computed from `visibleProjects` and `activeProjectIndex`
}

interface ComputedStoreState extends ComputedStoreProps {
    
}

const createComputedStore = ({allProjects}: ComputedStoreInitProps) => createStore<ComputedStoreState>((set)=>{
    return {
        visibleProjects: [...allProjects],
        activeProjectId: null
    };
});





export type BrowserStore = ReturnType<typeof createBrowserStore>;

export interface BrowserStoreInitProps {
    allProjects: ProjectInfo[]
}

export interface BrowserStoreProps {
    allProjects: ProjectInfo[],
    filterRangeInfo: FilterRangeInfo,
    ui: UIStore,
    filter: FilterStore,
    computed: ComputedStore,
}

export interface BrowserStoreState extends BrowserStoreProps {

}

export const createBrowserStore = ({allProjects}: BrowserStoreInitProps) => createStore<BrowserStoreState>((set,get,api)=>{
    const filterRangeInfo = collectFilterRangeInfo(allProjects);

    const ui = createUIStore();
    const filter = createFilterStore({filterRangeInfo, allProjects});
    const computed = createComputedStore({allProjects});
    
    return { 
        allProjects, filterRangeInfo, ui, filter, computed,




     };
});




export const BrowserStoreContext = createContext<BrowserStore | null>(null);
export function useBrowserContext<T>(
  selector: (state: BrowserStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const store = useContext(BrowserStoreContext);
  if (!store) throw new Error('Missing BearContext.Provider in the tree');
  return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}



export function useUIStore<T>(
    selector: (state: UIStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean
 ){ 
    const ui = useBrowserContext(state => state.ui);
    return useStoreWithEqualityFn(ui, selector, equalityFn);
 }


 export function useFilterStore<T>(
    selector: (state: FilterStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean
 ) {
    const filter = useBrowserContext(state => state.filter);
    return equalityFn ? useStoreWithEqualityFn(filter, selector, equalityFn) : useStore(filter, selector);
 }

 export function useComputedStore<T>(
    selector: (state: ComputedStoreState) => T,
    equalityFn?: (left: T, right: T) => boolean
 ) {
    const computed = useBrowserContext(state => state.computed);
    return useStoreWithEqualityFn<ComputedStore, T>(computed, selector, equalityFn);
 }