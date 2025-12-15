import React from "react";
import { type FilterFormStore, type FilterFormStoreState } from "./filterFormStore";
import { type TagSectionStore, type TagSectionStoreState } from "./tagSectionStore";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { useStore } from "zustand";
import { type TagType } from "../filterTypes";


export type FilterFormStoreContextValue = {
    filterFormStore: FilterFormStore,
    tagSectionStores: Record<TagType, React.RefObject<TagSectionStore | null>>
}
export const FilterFormStoreContext = React.createContext<FilterFormStoreContextValue| null>(null);

export const TagSectionStoreContext = React.createContext<TagSectionStore | null>(null);

export function useFilterFormStoreContext() {
    const state = React.useContext(FilterFormStoreContext);
    if(!state) throw new Error('Not in FilterFormStore Provider');
    return state;
}
export function useTagSectionStoreContext() {
    const state = React.useContext(TagSectionStoreContext);
    if(!state) throw new Error('Not in TagSectionStore Provider');
    return state;
}

export function useFilterFormStore<T>(selector: (state: FilterFormStoreState)=>T, equalityFn?: (left: T, right: T) => boolean): T {
    const {filterFormStore: store} = useFilterFormStoreContext();
    // return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
    return useStoreWithEqualityFn(store, selector, equalityFn || Object.is)
}
export function useTagSectionStore<T>(selector: (state: TagSectionStoreState)=>T, equalityFn?: (left: T, right: T) => boolean): T {
    const store = useTagSectionStoreContext();
    return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}


