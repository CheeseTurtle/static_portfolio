// import { createContext, useContext, useRef, type Dispatch, type SetStateAction } from 'react';
// // import { BrowserStoreContext, createBrowserStore, type BrowserStore, type BrowserStoreInitProps, type BrowserStoreState } from './stores/uiStore';
// import { BrowserStoreContext, createBrowserStore, type BrowserStore, type BrowserStoreInitProps, type BrowserStoreState } from './stores/browserStore';
// import { useStoreWithEqualityFn } from 'zustand/traditional';
// import { useStore } from 'zustand';



// export type BrowserProviderProps = React.PropsWithChildren<BrowserStoreInitProps>;

// export function BrowserStoreProvider({ children, ...props }: BrowserProviderProps) {
//   const storeRef = useRef<BrowserStore>(null);
//   if (!storeRef.current) {
//     storeRef.current = createBrowserStore(props);
//   }
//   return (
//     <BrowserStoreContext.Provider value={storeRef.current}>
//       {children}
//     </BrowserStoreContext.Provider>
//   )
// }



// // type NavigationContextValue = {
// //     activeProjectIndex: string | null;
// //     openedProjectId: string | null;
// //     urlProjectId: string | null;
// //     _urlReplace?: boolean;
// // };


// // type BrowserFixedDataContextValue = {
// //     filterRangeInfo: FilterRangeInfo,
// //     allProjects: ProjectData[],
// // }

// // type BrowserComputedDataContextValue = {
// //     visibleProjects: ProjectData[],
// //     activeProjectId: string | null,
// // };

// // type BrowserDataContextValue = {
// //     fixed: BrowserFixedDataContextValue,
// //     computed: BrowserComputedDataContextValue
// // };


// // type BrowserContextValue = {
// //     nav: NavigationContextValue,
// //     filter: FilterContextValue,
// //     data: BrowserDataContextValue,
// //     carouselOpen: boolean,
// //     sheetOpen: boolean,
// // };


