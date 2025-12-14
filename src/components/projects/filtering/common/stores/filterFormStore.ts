import { createStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";


import type { FilterStore } from "./filterStore";
import { TAGTYPES, type FilterRangeInfo, type TagType } from "../filterTypes";
import type { BrowserStore } from "./browserStore";
import { useCountStore } from "./countStoreContext";
import type { CountStore } from "./countStore";
import type { ProjectInfo } from "@/components/projects/types";
import { createTagSectionStore, type TagSectionStore } from "./tagSectionStore";





export type FilterFormStoreInitProps = {
    browserStore: BrowserStore,
    filterStore: FilterStore,
    registerReset: (resetFn: ()=>void) => ()=>void,
    projects: ProjectInfo[],
}

export type FilterFormStoreProps = {
    // readonly filterRangeInfo: FilterRangeInfo,
    readonly showYearSlider: boolean,
    // readonly categoryNames: string[],
    readonly tagSectionStores: Record<TagType, TagSectionStore>,
    readonly projects: ProjectInfo[],
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type FilterFormStoreActions = {
    // updateProjects: (projects: ProjectInfo[]) => void,
}

export type FilterFormStoreState = FilterFormStoreActions & FilterFormStoreProps;
export type FilterFormStore = ReturnType<typeof createFilterFormStore>



function createTagSectionStore_(tagType: TagType, countStore: CountStore, filterStore: FilterStore, rangeInfo: FilterRangeInfo,
    reset: ()=>void, registerReset: (resetFn: ()=>void) => ()=>void,) {
    return createTagSectionStore({
        countStore, filterStore, rangeInfo, registerReset, reset, tagType
    })
}

function createTagSectionStores(countStore: CountStore, filterStore: FilterStore, rangeInfo: FilterRangeInfo,
    resetTags: (tagType: TagType)=>void, registerReset: (resetFn: ()=>void) => ()=>void,) {
    return Object.fromEntries(TAGTYPES.map(tagType => [tagType, 
        createTagSectionStore_(tagType, countStore, filterStore, rangeInfo, ()=>resetTags(tagType), registerReset)
    ])) as Record<TagType, TagSectionStore>
}

export const createFilterFormStore= ({browserStore, filterStore, projects, registerReset}: FilterFormStoreInitProps)=>{
    // const filterStore = useFilterStore();
    const rangeInfo = browserStore.getState().filterRangeInfo;
    const countStore = useCountStore();
    const resetTags = filterStore.getState().resetTags;
    const tagSectionStores = createTagSectionStores(countStore, filterStore, rangeInfo, resetTags, registerReset);
    
    const showYearSlider = rangeInfo.minYear !== rangeInfo.maxYear;


    return createStore<FilterFormStoreState>()(subscribeWithSelector(()=>{    
        // function updateProjects(projects: ProjectInfo[]) {
        //     Object.values(tagSectionStores).forEach(store=>store.setState({projects}))
        //     set({projects})
        // }

        // api.subscribe(s=>s.projects, projects=>{
        //     Object.values(tagSectionStores).forEach(store=>store.setState({projects}))
        // }, {equalityFn: shallow})

        return {
            showYearSlider,
            tagSectionStores,
            projects,
            // updateProjects,
        }
    }));
}
