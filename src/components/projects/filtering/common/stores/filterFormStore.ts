import { createStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";


import type { FilterStore } from "./filterStore";
// import { TAGTYPES, type FilterRangeInfo, type TagType } from "../filterTypes";
import type { BrowserStore } from "./browserStore";
// import { useCountStore } from "./countStore";
// import type { CountStore } from "./countStore";
import type { ProjectInfo } from "@/components/projects/types";
// import { createTagSectionStore, type TagSectionStore } from "./tagSectionStore";





export type FilterFormStoreInitProps = {
    browserStore: BrowserStore,
    filterStore: FilterStore,
    projects: ProjectInfo[],
}

export type FilterFormStoreProps = {
    readonly yearValue: [number, number],
    // readonly filterRangeInfo: FilterRangeInfo,
    readonly showYearSlider: boolean,
    // readonly categoryNames: string[],
    // readonly tagSectionStores: Record<TagType, React.RefObject<TagSectionStore | null>>,
    readonly projects: ProjectInfo[],

    readonly registeredResets: Set<()=>void>,
    
    
    readonly canResetYear: boolean,
    readonly canResetCategories: boolean,
    readonly canResetTags: boolean,

  
    readonly _selectedCategoriesSet: Set<string>,
    readonly selectedCategories: string[],
    // readonly selectedTags: FilterStoreState['tags'],
}

type FilterFormStoreActions = {
    registerReset: (resetFn: ()=>void) => ()=>void,
    resetAll: () => void,
    // updateProjects: (projects: ProjectInfo[]) => void,
}

export type FilterFormStoreState = FilterFormStoreActions & FilterFormStoreProps;
export type FilterFormStore = ReturnType<typeof createFilterFormStore>



// function createTagSectionStore_(tagType: TagType, countStore: CountStore, filterStore: FilterStore, rangeInfo: FilterRangeInfo,
//     reset: ()=>void, registerReset: (resetFn: ()=>void) => ()=>void,) {
//     return createTagSectionStore({
//         countStore, filterStore, rangeInfo, registerReset, reset, tagType
//     })
// }

// function createTagSectionStores(countStore: CountStore, filterStore: FilterStore, rangeInfo: FilterRangeInfo,
//     resetTags: (tagType: TagType)=>void, registerReset: (resetFn: ()=>void) => ()=>void,) {
//     return Object.fromEntries(TAGTYPES.map(tagType => [tagType, 
//         createTagSectionStore_(tagType, countStore, filterStore, rangeInfo, ()=>resetTags(tagType), registerReset)
//     ])) as Record<TagType, TagSectionStore>
// }

export const createFilterFormStore= ({browserStore, projects}: FilterFormStoreInitProps)=>{
    const rangeInfo = browserStore.getState().filterRangeInfo;
    // const countStore = useCountStore();
    // const resetTags = filterStore.getState().resetTags;
    
    
    const store = createStore<FilterFormStoreState>()(subscribeWithSelector((_set, get, _api)=>{

        const registerReset: FilterFormStoreState['registerReset'] = (resetFn) => {
            get().registeredResets.add(resetFn);
            return () => { get().registeredResets.delete(resetFn); }
        }
        // const tagSectionStores = createTagSectionStores(countStore, filterStore, rangeInfo, resetTags, registerReset);
        
        const showYearSlider = rangeInfo.minYear !== rangeInfo.maxYear;
        // function updateProjects(projects: ProjectInfo[]) {
        //     Object.values(tagSectionStores).forEach(store=>store.setState({projects}))
        //     set({projects})
        // }

        // api.subscribe(s=>s.projects, projects=>{
        //     Object.values(tagSectionStores).forEach(store=>store.setState({projects}))
        // }, {equalityFn: shallow})



       

        return {
            registeredResets: new Set<()=>void>(),
            showYearSlider,
            // tagSectionStores,
            projects,
            // updateProjects,
            resetAll() {
                get().registeredResets.forEach(fn=>fn());
            },
            registerReset,
            canResetYear: false,
            canResetCategories: false,
            canResetTags: false,
            yearValue: [rangeInfo.minYear, rangeInfo.maxYear],
            selectedCategories: [],
            _selectedCategoriesSet: new Set(),
            // selectedTags: null,
            
                 
        }
    }));

    return store;
}