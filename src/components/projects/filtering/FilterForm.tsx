import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode } from "react";
import type { FilterSheetProps } from "./FilterSheet";
// import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import TagFilterSection from "./sections/TagFilterSection";
// import {Slider} from "@/components/ui/slider";
import YearSlider from "@/components/projects/filtering/sections/YearSlider";
import { cn } from "@/lib/utils";
import type { FilterAction, FilterRangeInfo, FilterState } from "./common/filterTypes";
import type { ProjectData, ProjectInfo } from "../types";
import { doubleEq, tripleEq, useBrowserContext, useBrowserStore, useFilterContext, useFilterContextItems, type BrowserStore } from "./common/browserContext";
import { Button } from "@/components/ui/button";
import { FilterField } from "./common/stores/filterStore";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ResetButton from "./common/ResetButton";
import { Toggle } from "@/components/ui/toggle";

// type SliderProps = React.ComponentProps<typeof Slider>;


type FilterFormProps = {
    projects: ProjectInfo[],
    // state: FilterState,
    // dispatch: Dispatch<FilterAction>,
    registerReset: (resetFn: ()=>void) => ()=>void,
    inSheet?: boolean,
    // browserStore: BrowserStore,
} & FilterSheetProps;

export interface FilterFormHandle {};

// type CompareYearRanges = {
//     // (minYear: number, maxYear: number, a: [number | null, number | null] | null, b: [number | null, number | null] | null): boolean
//     (minYear: number, maxYear: number, a: null | [null, null], b: null | [null, null]): true,
//     (minYear: number, maxYear: number, a: [number, null], b: null | [null, number | null]): false,
//     (minYear: number, maxYear: number, a: [number, null], b: null | [null, number | null]): false,
        
// };

const compareYearRanges = (minYear: number, maxYear: number, a: [number | null, number | null] | null, b: [number | null, number | null] | null): boolean => {
     if(!(a || b)) return true;
    const [aHasMin, aHasMax] = a ? [
        a[0] === null || a[0] === undefined || a[0] <= minYear,
        a[1] === null || a[1] === undefined || a[1] >= maxYear
    ] : [true, true];

    const [bHasMin, bHasMax] = b ? [
        !b || b[0] === null || b[0] === undefined || b[0] <= minYear,
        !b ||b[1] === null || b[1] === undefined || b[1] >= maxYear
    ] : [true, true];

    const minEq = ((aHasMin === bHasMin) && aHasMin) || (a?.[0] === b?.[0]);
    const maxEq = ((aHasMax === bHasMax) && aHasMax) || (a?.[1] === b?.[1]);

    return minEq && maxEq;
}




export type TagType = ('lang' | 'topic' | 'skill');  // | 'concept');
const TAGTYPES: TagType[] = ['lang', 'skill', 'topic'];


type FilterFormSectionProps = {
    filterField: 'categories' | 'year' | 'tags';
    headingExtra?: ReactNode,
    children: ReactNode,
    canReset: boolean,
    resetFn: () => void,
};


// function AndOrToggle() {
//     return <Toggle></Toggle>
// }

function FilterFormSection({filterField, headingExtra, children, resetFn, canReset}: FilterFormSectionProps) {
    const resetLabel = "Reset " + filterField;
    return <div className={`filter-${filterField} space-y-0 mb-5`}>
        <div className="space-y-1 inline-flex">
            <div role="heading" aria-level={3} className="text-sm font-semibold">{filterField[0].toLocaleUpperCase() + filterField.slice(1)}</div>
            {headingExtra ?? null}
            <ResetButton disabled={!canReset} onClick={()=>resetFn()}>{resetLabel}</ResetButton>
        </div>
        {children}
    </div>   
}


const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>((props, ref) => {
    
    // #region Set/Reset
    const setYear = useFilterContext(s=>s.setYear);
    const setCategories = useFilterContext(s=>s.setCategories);

    const resetFilter = useFilterContext(s=>s.resetFilter);
    const resetYear = useCallback((resetMin: boolean = true, resetMax: boolean = true)=>{
        const mask = (resetMin ? (resetMax ? FilterField.ALL_YEAR : FilterField.MIN_YEAR) : (resetMax ? FilterField.MAX_YEAR : null));
        (mask !== null) && resetFilter({mask});
    }, [resetFilter]);
    const resetCategories = useCallback(()=>resetFilter({mask: FilterField.CATEGORY}), [resetFilter]);
    const resetTags = useCallback((tagTypes?: TagType | TagType[]) => {
        resetFilter({mask: FilterField.TAG, tagTypes});
    }, [resetFilter]);

    // #endregion
    
    // #region Values
    const year0 = useFilterContext(s=>s.year?.[0], (a,b) => a === b || (a ?? props.rangeInfo.minYear) === (b ?? props.rangeInfo.minYear));
    const year1 = useFilterContext(s=>s.year?.[1], (a,b) => a === b || (a ?? props.rangeInfo.maxYear) === (b ?? props.rangeInfo.maxYear));
    const yearValue = useMemo(()=>[year0 ?? props.rangeInfo.minYear, year1 ?? props.rangeInfo.maxYear], [year0, year1, props.rangeInfo.minYear, props.rangeInfo.maxYear]);
    
    const categoryNames = useMemo(()=>Array.from(props.rangeInfo.categories), [props.rangeInfo.categories]);
    const selectedCategoriesSet = useFilterContext(state=>state.categories, (a,b)=>(a.size === b.size && [...a].every(x=>b.has(x))));
    const selectedCategories = Array.from(selectedCategoriesSet);
    const selectedTags = useFilterContext(s=>s.tags);
    // #endregion


    const canResetYear = useMemo(()=>yearValue[0] !== props.rangeInfo.minYear || yearValue[1] !== props.rangeInfo.maxYear, [yearValue, props.rangeInfo.minYear, props.rangeInfo.maxYear]);
    const canResetCategories = useMemo(()=>selectedCategoriesSet.size > 0, [selectedCategoriesSet.size]);
    const canResetTags = selectedTags ? Object.values(selectedTags).some((v)=>v.size) : false;
    const canToggleCategory = useFilterContext(s=>s.canToggleCategory);
    

    // #region Year slider
    const yearSlider = <YearSlider value={yearValue} min={props.rangeInfo.minYear} max={props.rangeInfo.maxYear} defaultValue={[props.rangeInfo.minYear, props.rangeInfo.maxYear]}
        // onValueChange={(value: [number, number]) => props.dispatch({type: 'SET_YEAR', payload: value})}
        onValueChange={(value: [number, number])=> setYear(value)}
        onValueCommit={(value: [number, number]) => console.log(value)}
        // vocab=""
        color='green'
        // minStepsBetweenThumbs={1}
        step={1}
        className={cn("w-[60%]", undefined)}
    ></YearSlider>
    // #endregion

    // #region Categories

    // #endregion


    // #region Tags
    const tagSections = useMemo( ()=>
        TAGTYPES.map((tt =>
            <TagFilterSection reset={()=>resetTags(tt)} projects={props.projects} key={tt} tagType={tt} rangeInfo={props.rangeInfo} registerReset={props.registerReset}></TagFilterSection>
        ))
    , [props.rangeInfo, props.registerReset, props.projects, resetTags]);
    // #endregion


    return <>
        <FilterFormSection filterField="year" resetFn={resetYear} canReset={canResetYear} headingExtra={<span>{year0 ?? props.rangeInfo.minYear} - {year1 ?? props.rangeInfo.maxYear}</span>}>
            {yearSlider}
        </FilterFormSection>

        <FilterFormSection filterField="categories" resetFn={resetCategories} canReset={canResetCategories}>
            <ToggleGroup type="multiple" variant="default" value={selectedCategories} onValueChange={setCategories}>
                {categoryNames.map(name=>{
                    const enabled = !selectedCategories.length || canToggleCategory(name, selectedCategories.includes(name));
                    return <ToggleGroupItem key={name} value={name} disabled={!enabled} className="disabled:text-shadow-accent">{name[0].toLocaleUpperCase() + name.slice(1)}</ToggleGroupItem>;
                })}
            </ToggleGroup>
        </FilterFormSection>

        <FilterFormSection filterField="tags" resetFn={resetTags} canReset={canResetTags}>
            {tagSections}
        </FilterFormSection>
    </>;
});


export default FilterForm;