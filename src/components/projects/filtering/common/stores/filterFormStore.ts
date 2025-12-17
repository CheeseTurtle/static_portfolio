import { createStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { FilterStore } from "./filterStore";
import type { BrowserStore } from "./browserStore";
import type { ProjectInfo } from "@/components/projects/types";

export type FilterFormStoreInitProps = {
    browserStore: BrowserStore,
    filterStore: FilterStore,
    projects: ProjectInfo[],
}

export type FilterFormStoreProps = {
    readonly yearValue: [number, number],
    readonly showYearSlider: boolean,
    readonly projects: ProjectInfo[],

    readonly registeredResets: Set<()=>void>,
    
    readonly canResetYear: boolean,
    readonly canResetCategories: boolean,
    readonly canResetTags: boolean,

  
    readonly _selectedCategoriesSet: Set<string>,
    readonly selectedCategories: string[],
}

type FilterFormStoreActions = {
    registerReset: (resetFn: ()=>void) => ()=>void,
    resetAll: () => void,
}

export type FilterFormStoreState = FilterFormStoreActions & FilterFormStoreProps;
export type FilterFormStore = ReturnType<typeof createFilterFormStore>


export const createFilterFormStore= ({browserStore, projects}: FilterFormStoreInitProps)=>{
    const rangeInfo = browserStore.getState().filterRangeInfo;
    
    const store = createStore<FilterFormStoreState>()(subscribeWithSelector((_set, get, _api)=>{

        const registerReset: FilterFormStoreState['registerReset'] = (resetFn) => {
            get().registeredResets.add(resetFn);
            return () => { get().registeredResets.delete(resetFn); }
        }
        
        const showYearSlider = rangeInfo.minYear !== rangeInfo.maxYear;

        return {
            registeredResets: new Set<()=>void>(),
            showYearSlider,
            projects,
            resetAll : () => get().registeredResets.forEach(fn=>fn()),
            registerReset,
            canResetYear: false,
            canResetCategories: false,
            canResetTags: false,
            yearValue: [rangeInfo.minYear, rangeInfo.maxYear],
            selectedCategories: [],
            _selectedCategoriesSet: new Set(),
        }
    }));

    return store;
}