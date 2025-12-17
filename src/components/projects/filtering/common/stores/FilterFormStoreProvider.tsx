import React from "react";
import { createFilterFormStore, type FilterFormStore, type FilterFormStoreInitProps } from "./filterFormStore";
import { createTagSectionStore, type TagSectionStore, type TagSectionStoreInitProps } from "./tagSectionStore";
import { shallow } from "zustand/shallow";
import { TAGTYPES, type FilterRangeInfo, type TagType } from "../filterTypes";
import { createRecordFromKeys } from "@/lib/objutil";
import { FilterFormStoreContext, TagSectionStoreContext, type FilterFormStoreContextValue } from "./filterFormStoreContext";
import { useBrowserStore, useFilterStore } from "../browserContext";



export function FilterFormStoreProvider({children, rangeInfo, ...props}: Omit<FilterFormStoreInitProps, 'browserStore' | 'filterStore'> & Omit<React.ComponentProps<typeof FilterFormStoreContext.Provider>, 'value'> & {rangeInfo: FilterRangeInfo}) {
    const storeRef = React.useRef<FilterFormStore | null>(null);
    const storesRef = React.useRef<Record<TagType, React.RefObject<TagSectionStore | null>>>(
        createRecordFromKeys<Record<TagType, React.RefObject<TagSectionStore | null>>>(TAGTYPES, (_)=>React.createRef<TagSectionStore | null>()))

    const browserStore = useBrowserStore();
    const filterStore = useFilterStore();

    if(!storeRef.current) {
        storeRef.current = createFilterFormStore({...props, browserStore, filterStore});
        storesRef.current = createRecordFromKeys(TAGTYPES, (tagType)=>(storesRef.current?.[tagType] ?? React.createRef()));
    }

    filterStore.subscribe(s=>s.year, (v0) => {
        // console.log('FILTERSTORE YEAR CHANGED')
            const yearValue: [number, number] = [v0?.[0] ?? rangeInfo.minYear, v0?.[1] ?? rangeInfo.maxYear] as [number, number];
            storeRef.current?.setState({
                yearValue,
                canResetYear: yearValue[0] !== rangeInfo.minYear || yearValue[1] !== rangeInfo.maxYear
            });
        }, {equalityFn: (v0, v1) => {
            const [aMin, aMax] = v0 ?? [undefined, undefined];
            const [bMin, bMax] = v1 ?? [undefined, undefined];

            // console.log('YEAR VALUE:', v0, v1)

            const year0Unchanged = aMin === bMin || (aMin ?? rangeInfo.minYear) === (bMin ?? rangeInfo.minYear)
            const year1Unchanged = aMax === bMax || (aMax ?? rangeInfo.maxYear) === (bMax ?? rangeInfo.maxYear)
            return !(year0Unchanged && year1Unchanged);
        }})

    filterStore.subscribe(s=>s.categories, (selectedCategoriesSet)=>{
            storeRef.current?.setState({
                selectedCategories: Array.from(selectedCategoriesSet),
                canResetCategories: selectedCategoriesSet.size > 0,
            })
        }, {equalityFn: (a,b)=>(a.size === b.size && [...a].every(x=>b.has(x)))})

    filterStore.subscribe(s=>s.tags, selectedTags => {
        storeRef.current?.setState({
                canResetTags: selectedTags ? Object.values(selectedTags).some((v)=>v.size) : false
            })
        }, {equalityFn: shallow})


    const value: FilterFormStoreContextValue = React.useMemo(()=>({
        filterFormStore: storeRef.current!,
        tagSectionStores: storesRef.current,
    }), [])

    return <FilterFormStoreContext.Provider value={value}>
        {children}
    </FilterFormStoreContext.Provider>
}

//
export function TagSectionStoreProvider({storeRef, children, ...props}: TagSectionStoreInitProps & Omit<React.ComponentProps<typeof TagSectionStoreContext.Provider>, 'value'> & {storeRef: React.RefObject<TagSectionStore | null>}) {
    if(!storeRef.current)
        storeRef.current = createTagSectionStore(props);

    return <TagSectionStoreContext.Provider value={storeRef.current}>
        {children}
    </TagSectionStoreContext.Provider>;
}