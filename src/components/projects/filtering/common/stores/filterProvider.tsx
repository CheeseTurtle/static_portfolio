import {createFilterStore, type FilterInitProps, type FilterStore} from "./filterStore";
import {FilterContext} from "./filterContext";

// Provider wrapper
import { useRef } from 'react'

type FilterProviderProps = React.PropsWithChildren<FilterInitProps>

export function FilterProvider({ children, ...props }: FilterProviderProps) {
  const storeRef = useRef<FilterStore>(null);
  if (!storeRef.current) {
    storeRef.current = createFilterStore(props)
  }
  return (
    <FilterContext.Provider value={storeRef.current}>
      {children}
    </FilterContext.Provider>
  )
}



// // Provider wrapper & custom hook consumer
// function App2() {
//   return (
//     <BearProvider bears={2}>
//       <HookConsumer />
//     </BearProvider>
//   )
// }