import { forwardRef, useEffect, useMemo, useState, type Dispatch } from "react";
import type { FilterSheetProps } from "./FilterSheet";
// import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import TagFilterSection from "./sections/TagFilterSection";
// import {Slider} from "@/components/ui/slider";
import YearSlider from "@/components/projects/filtering/sections/YearSlider";
import { cn } from "@/lib/utils";
import type { FilterAction, FilterRangeInfo, FilterState } from "./common/filterTypes";
import type { ProjectData, ProjectInfo } from "../types";
import { doubleEq, tripleEq, useBrowserContext, useBrowserStore, useFilterContext, type BrowserStore } from "./common/browserContext";

// type SliderProps = React.ComponentProps<typeof Slider>;


type FilterFormProps = {
    projects: ProjectInfo[],
    // state: FilterState,
    // dispatch: Dispatch<FilterAction>,
    registerReset: (resetFn: ()=>void) => ()=>void,
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
            <TagFilterSection projects={props.projects} key={tt} tagType={tt} rangeInfo={props.rangeInfo} registerReset={props.registerReset}></TagFilterSection>
        ))
    , [props.rangeInfo, props.registerReset, props.projects]);

    return <>
        {slider}
        {tagSections}
    </>;
});


export default FilterForm;