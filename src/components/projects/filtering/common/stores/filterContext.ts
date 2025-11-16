import { createContext } from 'react'
import type { FilterStore } from './filterStore';

export const FilterContext = createContext<FilterStore | null>(null);


//////////////////////////////////////////////////////////////////////////////
// // Provider implementation
// import { useRef } from 'react'

// function App() {
//   const store = useRef(createBearStore()).current
//   return (
//     <BearContext.Provider value={store}>
//       <BasicConsumer />
//     </BearContext.Provider>
//   )
// }


// // Consumer component
// import { useContext } from 'react'
// import { useStore } from 'zustand'

// function BasicConsumer() {
//   const store = useContext(BearContext)
//   if (!store) throw new Error('Missing BearContext.Provider in the tree')
//   const bears = useStore(store, (s) => s.bears)
//   const addBear = useStore(store, (s) => s.addBear)
//   return (
//     <>
//       <div>{bears} Bears.</div>
//       <button onClick={addBear}>Add bear</button>
//     </>
//   )
// }
