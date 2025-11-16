

// // Allow custom equality function by using useStoreWithEqualityFn instead of useStore
// import { useContext } from 'react'
// import { useStoreWithEqualityFn } from 'zustand/traditional'
// import type { FilterState } from '../filterTypes'
// import { FilterContext } from './filterContext'


// export function useFilterContext<T>(
//   selector: (state: FilterState) => T,
//   equalityFn?: (left: T, right: T) => boolean,
// ): T {
//   const store = useContext(FilterContext)
//   if (!store) throw new Error('Missing BearContext.Provider in the tree')
//   return useStoreWithEqualityFn(store, selector, equalityFn)
// }

// ////////////////////////////////////////////////////////////////

// // // Mimic the hook returned by `create`
// // import { useContext } from 'react'
// // import { useStore } from 'zustand'
// // import { FilterContext } from './filterContext'


// // function useBearContext<T>(selector: (state: BearState) => T): T {
// //   const store = useContext(FilterContext)
// //   if (!store) throw new Error('Missing BearContext.Provider in the tree')
// //   return useStore(store, selector)
// // }


// // // Consumer usage of the custom hook
// // function CommonConsumer() {
// //   const bears = useBearContext((s) => s.bears)
// //   const addBear = useBearContext((s) => s.addBear)
// //   return (
// //     <>
// //       <div>{bears} Bears.</div>
// //       <button onClick={addBear}>Add bear</button>
// //     </>
// //   )
// // }