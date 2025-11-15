// import type { ProjectInfo } from "@/components/projects/types";
// import { collectFilterRangeInfo, type FilterRangeInfo } from "../filterTypes";
// import { create, createStore } from "zustand";

// import { createComputed } from 'zustand-computed';

// // type BrowserFixedDataContextValue = {
// //     filterRangeInfo: FilterRangeInfo,
// //     allProjects: ProjectInfo[],
// // }

// // type BrowserComputedDataContextValue = {
// //     visibleProjects: ProjectInfo[],
// //     activeProjectId: string | null,
// // };

// // type BrowserDataContextValue = {
// //     fixed: BrowserFixedDataContextValue,
// //     computed: BrowserComputedDataContextValue
// // };

// type BrowserDataInitProps = {
//     allProjects: ProjectInfo[]
// }


// interface BrowserFixedData {
//     filterRangeInfo: FilterRangeInfo,
//     allProjects: ProjectInfo[]
// }

// interface BrowserDataProps {
//     fixed: BrowserFixedData,
//     activeProjectIndex: number | null,
// }


// interface BrowserDataStateBase extends BrowserDataProps {
//     someFunc: (arg: any) => void,
// }


// interface BrowserDataState extends BrowserDataStateBase {
//     activeProjectId: string | undefined, // computed
//     visibleProjects: ProjectInfo[], // computed
// }



// export type DataStoreBase = ReturnType<typeof createDataStoreBase>;


// export const createDataStoreBase = (
//   {allProjects}: BrowserDataInitProps //& Partial<BrowserDataProps>,
// ) => {
//   const filterRangeInfo = collectFilterRangeInfo(allProjects);
//   const DEFAULT_PROPS: BrowserDataProps = {
//     fixed: { allProjects, filterRangeInfo },
//     activeProjectIndex: null,
    
//   };

//   return createStore<BrowserDataStateBase>()((set) => ({
//     ...DEFAULT_PROPS,
//     // ...initProps,
//     someFunc: (arg: any) => set((state) => {
//         return {}
//     })
//   }));
// }



// const computed = createComputed((state: DataStoreBase): DataStore => ({
//   countSq: state.count ** 2,
// }))

// export const useDataStore = create<BrowserDataState>(computed(
//     set((state)=>{



//     })
// ))