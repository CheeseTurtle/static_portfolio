import { createStore, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";


import type { FilterStore, FilterStoreState } from "./filterStore";
import { FilterField, type FilterRangeInfo, type TagType } from "../filterTypes";
import type { BrowserStore, BrowserStoreState } from "./browserStore";
import React from "react";





export type FilterFormStoreInitProps = {
    browserStore: BrowserStore,
    filterStore: FilterStore,
}

export type FilterFormStoreProps = {
    readonly yearValue: [number, number],

    readonly categoryNames: string[],
    readonly _selectedCategoriesSet: Set<string>,
    readonly selectedCategories: string[],
    readonly selectedTags: FilterStoreState['tags'],

    readonly canResetYear: boolean,
    readonly canResetCategories: boolean,
    readonly canResetTags: boolean,

    canToggleCategory: FilterStoreState['canToggleCategory'],

    readonly showYearSlider: boolean,
    readonly filterRangeInfo: FilterRangeInfo,
}

type ResetFunctions = {
    // resetFilter: FilterStoreState['resetFilter'],
    resetYear: (resetMin?: boolean, resetMax?: boolean) => void,
    resetCategories: ()=>void,
    resetTags: (tagTypes?: TagType | TagType[]) => void,
}
type FilterFormStoreActions = ResetFunctions & {
    setYear: FilterStoreState['setYear'],
    setCategories: FilterStoreState['setCategories'],
    setURLSyncFlag: BrowserStoreState['setURLSyncFlag'],
}

export type FilterFormStoreState = FilterFormStoreActions & FilterFormStoreProps;
export type FilterFormStore = ReturnType<typeof createFilterFormStore>

export const createFilterFormStore= ({browserStore, filterStore}: FilterFormStoreInitProps)=>{
    // TODO: Move these to filterStore
    const setYear = useStore(filterStore, s=>s.setYear);
    const setCategories = useStore(filterStore, s=>s.setCategories);

    const resetFilter = useStore(filterStore, s=>s.resetFilter);
    const resetYear = React.useCallback((resetMin: boolean = true, resetMax: boolean = true)=>{
        const mask = (resetMin ? (resetMax ? FilterField.ALL_YEAR : FilterField.MIN_YEAR) : (resetMax ? FilterField.MAX_YEAR : null));
        if (mask !== null) resetFilter({mask});
    }, [resetFilter]);

    const setURLSyncFlag = useStore(browserStore, s=>s.setURLSyncFlag);
    const resetCategories = React.useCallback(()=>resetFilter({mask: FilterField.CATEGORY}), [resetFilter]);
    const resetTags = React.useCallback((tagTypes?: TagType | TagType[]) => {
        resetFilter({mask: FilterField.TAG, tagTypes});
    }, [resetFilter]);

    const canToggleCategory = useStore(filterStore, s=>s.canToggleCategory)

    const rangeInfo = useStore(browserStore, s=>s.filterRangeInfo);

    const categoryNames = Array.from(rangeInfo.categories);

    const showYearSlider = rangeInfo.minYear !== rangeInfo.maxYear;

    return createStore<FilterFormStoreState>()(subscribeWithSelector((set,get,api)=>{
        filterStore.subscribe(s=>s.year, (v0) => {
            const yearValue: [number, number] = [v0?.[0] ?? rangeInfo.minYear, v0?.[1] ?? rangeInfo.maxYear] as [number, number];
            set({
                yearValue,
                canResetYear: yearValue[0] !== rangeInfo.minYear || yearValue[1] !== rangeInfo.maxYear
            });
        }, {equalityFn: (v0, v1) => {
            const [aMin, aMax] = v0 ?? [undefined, undefined];
            const [bMin, bMax] = v1 ?? [undefined, undefined];

            const year0Unchanged = aMin === bMin || (aMin ?? rangeInfo.minYear) === (bMin ?? rangeInfo.minYear)
            const year1Unchanged = aMax === bMax || (aMax ?? rangeInfo.maxYear) === (bMax ?? rangeInfo.maxYear)
            return !(year0Unchanged && year1Unchanged);
        }})

        filterStore.subscribe(s=>s.categories, (selectedCategoriesSet)=>{
            set({
                _selectedCategoriesSet: selectedCategoriesSet,
                selectedCategories: Array.from(selectedCategoriesSet),
                canResetCategories: selectedCategoriesSet.size > 0,
            })
        }, {equalityFn: (a,b)=>(a.size === b.size && [...a].every(x=>b.has(x)))})

        filterStore.subscribe(s=>s.tags, tags => {
            set({
                selectedTags: tags,
                canResetTags: tags ? Object.values(tags).some((v)=>v.size) : false
            })
        })

        return {
            setYear, setCategories, setURLSyncFlag, resetYear, resetCategories, resetTags, canToggleCategory,
            showYearSlider, categoryNames,
            canResetCategories: false,
            canResetTags: false,
            canResetYear: false,
            filterRangeInfo: rangeInfo,
            selectedCategories: [],
            yearValue: [rangeInfo.minYear, rangeInfo.maxYear],
            selectedTags: filterStore.getState().tags,
            _selectedCategoriesSet: new Set(),


        }
    }));
}
