import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type Dispatch } from "react";
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

const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>((props, ref) => {
    const setYear = useFilterContext(s=>s.setYear);
    const resetFilter = useFilterContext(s=>s.resetFilter);
    const setCategories = useFilterContext(s=>s.setCategories);
    // const {setYear, resetFilter, toggleCategory} = useFilterContextItems(['resetFilter', 'setYear', 'toggleCategory']);
    
    // const year = useFilterContext(s=>s.year, (a,b) => compareYearRanges(props.rangeInfo.minYear, props.rangeInfo.maxYear, a, b)); 
    const year0 = useFilterContext(s=>s.year?.[0], (a,b) => a === b || (a ?? props.rangeInfo.minYear) === (b ?? props.rangeInfo.minYear));
    const year1 = useFilterContext(s=>s.year?.[1], (a,b) => a === b || (a ?? props.rangeInfo.maxYear) === (b ?? props.rangeInfo.maxYear));

    const yearValue = useMemo(()=>[year0 ?? props.rangeInfo.minYear, year1 ?? props.rangeInfo.maxYear], [year0, year1, props.rangeInfo.minYear, props.rangeInfo.maxYear]);

    // // const sheetOpen = useBrowserContext(s=>s.sheetOpen);
    // const [showTooltips, setShowTooltips] = useState<boolean>(false);

    // const browserStore = useBrowserStore();

    // useEffect(()=>browserStore.subscribe(s=>s.sheetOpen, (sheetOpen, prevSheetOpen) => {
    //     // if(sheetOpen === prevSheetOpen) return;
    //     setShowTooltips(sheetOpen);
    // }), [setShowTooltips, browserStore]);


    const resetYear = useCallback((resetMin: boolean = true, resetMax: boolean = true)=>{
        const mask = (resetMin ? (resetMax ? FilterField.ALL_YEAR : FilterField.MIN_YEAR) : (resetMax ? FilterField.MAX_YEAR : null));
        (mask !== null) && resetFilter({mask});
    }, [resetFilter]);

    const resetCategories = useCallback(()=>resetFilter({mask: FilterField.CATEGORY}), [resetFilter]);

    const resetTags = useCallback((tagTypes?: TagType | TagType[]) => {
        resetFilter({mask: FilterField.TAG, tagTypes});
    }, [resetFilter]);

    const categoryNames = useMemo(()=>Array.from(props.rangeInfo.categories), [props.rangeInfo.categories]);


    // Year slider
    const slider = <YearSlider value={yearValue} min={props.rangeInfo.minYear} max={props.rangeInfo.maxYear} defaultValue={[props.rangeInfo.minYear, props.rangeInfo.maxYear]}
        // onValueChange={(value: [number, number]) => props.dispatch({type: 'SET_YEAR', payload: value})}
        onValueChange={(value: [number, number])=> setYear(value)}
        onValueCommit={(value: [number, number]) => console.log(value)}
        // vocab=""
        color='green'
        // minStepsBetweenThumbs={1}
        step={1}
        className={cn("w-[60%]", undefined)}
    ></YearSlider>

    // Tags

    const tagSections = useMemo( ()=>
        TAGTYPES.map((tt =>
            <TagFilterSection reset={()=>resetTags(tt)} projects={props.projects} key={tt} tagType={tt} rangeInfo={props.rangeInfo} registerReset={props.registerReset}></TagFilterSection>
        ))
    , [props.rangeInfo, props.registerReset, props.projects, resetTags]);

    const selectedCategoriesSet = useFilterContext(state=>state.categories, (a,b)=>(a.size === b.size && [...a].every(x=>b.has(x))));
    const selectedCategories = Array.from(selectedCategoriesSet);

    // const onCategoriesChange = useCallback((value: string[]) => {
        
    // }, [selectedCategories, toggleCategory]);

    return <>
        <div className='filter-year'>
            <div className="inline-flex">
                <h3>Year</h3>
                <span>{year0 ?? props.rangeInfo.minYear} - {year1 ?? props.rangeInfo.maxYear}</span>
                <ResetButton onClick={()=>{
                    // console.log('Clicked'); 
                    resetYear()
                }}>Reset year</ResetButton>
                <span>Hello</span>
            </div>
            {slider}
        </div>
        <div className='filter-categories'>
            <div className='inline-flex'>
                <h3>Categories</h3>
                <Button onClick={()=>resetCategories()}>Reset categories</Button>
            </div>
            <ToggleGroup type="multiple" variant="default" value={selectedCategories} onValueChange={setCategories}>
                {categoryNames.map(name=><ToggleGroupItem key={name} value={name} >{name}</ToggleGroupItem>)}
            </ToggleGroup>

        </div>
        <div className='filter-tags'>
            <div className="inline-flex">
                <h3>Tags</h3>
                <ResetButton onClick={()=>resetTags()}>Reset tags</ResetButton>
            </div>
            {tagSections}
        </div>
    </>;
});


export default FilterForm;