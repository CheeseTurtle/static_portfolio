import React from "react";
import { createFilterFormStore, type FilterFormStore, type FilterFormStoreInitProps, type FilterFormStoreState } from "./filterFormStore";
import { createTagSectionStore, type TagSectionStore, type TagSectionStoreInitProps, type TagSectionStoreState } from "./tagSectionStore";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { useStore } from "zustand";

const FilterFormStoreContext = React.createContext<FilterFormStore|null>(null);

const TagSectionStoreContext = React.createContext<TagSectionStore | null>(null);

function useFilterFormStoreContext() {
    const state = React.useContext(FilterFormStoreContext);
    if(!state) throw new Error('Not in FilterFormStore Provider');
    return state;
}
function useTagSectionStoreContext() {
    const state = React.useContext(TagSectionStoreContext);
    if(!state) throw new Error('Not in TagSectionStore Provider');
    return state;
}

export function useFilterFormStore<T>(selector: (state: FilterFormStoreState)=>T, equalityFn?: (left: T, right: T) => boolean): T {
    const store = useFilterFormStoreContext();
    return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}
export function useTagSectionStore<T>(selector: (state: TagSectionStoreState)=>T, equalityFn?: (left: T, right: T) => boolean): T {
    const store = useTagSectionStoreContext();
    return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}



export function FilterFormStoreProvider({children, ...props}: FilterFormStoreInitProps & Omit<React.ComponentProps<typeof FilterFormStoreContext.Provider>, 'value'>) {
    const storeRef = React.useRef<FilterFormStore | null>(null);

    if(!storeRef.current)
        storeRef.current = createFilterFormStore(props);

    return <FilterFormStoreContext.Provider value={storeRef.current}>
        {children}
    </FilterFormStoreContext.Provider>
}

export function TagSectionStoreProvider({children, ...props}: TagSectionStoreInitProps & Omit<React.ComponentProps<typeof TagSectionStoreContext.Provider>, 'value'>) {
    const storeRef = React.useRef<TagSectionStore>(null);

    if(!storeRef.current)
        storeRef.current = createTagSectionStore(props);

    return <TagSectionStoreContext.Provider value={storeRef.current}>
        {children}
    </TagSectionStoreContext.Provider>
}