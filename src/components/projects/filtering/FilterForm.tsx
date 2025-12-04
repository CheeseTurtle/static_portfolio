import { forwardRef, useCallback, useMemo, type ReactNode } from "react";
import type { FilterSheetProps } from "./FilterSheet";
// import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import TagFilterSection from "./sections/TagFilterSection";
// import {Slider} from "@/components/ui/slider";
import YearSlider from "@/components/projects/filtering/sections/YearSlider";
import { cn } from "@/lib/utils";
import type { ProjectInfo } from "../types";
import { useBrowserContext, useFilterContext } from "./common/browserContext";
import { FilterField } from "./common/stores/filterStore";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ResetButton from "./common/ResetButton";
import YearValue from "./sections/YearValue";
import { URLSyncFlag } from "./common/stores/browserStore";
import { WrappingToggleGroup, WrappingToggleGroupItem } from "./common/WrappingToggleGroup";

// type SliderProps = React.ComponentProps<typeof Slider>;


type FilterFormProps = {
    projects: ProjectInfo[],
    // state: FilterState,
    // dispatch: Dispatch<FilterAction>,
    registerReset: (resetFn: ()=>void) => ()=>void,
    inSheet?: boolean,
    // browserStore: BrowserStore,
} & FilterSheetProps;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FilterFormHandle {};

// type CompareYearRanges = {
//     // (minYear: number, maxYear: number, a: [number | null, number | null] | null, b: [number | null, number | null] | null): boolean
//     (minYear: number, maxYear: number, a: null | [null, null], b: null | [null, null]): true,
//     (minYear: number, maxYear: number, a: [number, null], b: null | [null, number | null]): false,
//     (minYear: number, maxYear: number, a: [number, null], b: null | [null, number | null]): false,
        
// };


// TODO: Move to comparison file
export const compareYearRanges = (minYear: number, maxYear: number, a: [number | null, number | null] | null, b: [number | null, number | null] | null): boolean => {
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
    return <section className={`filter-${filterField} space-y-0 mb-5`} aria-labelledby={`filter-${filterField}-heading`}>
        <div className="space-y-1 inline-flex items-center gap-3">
            <h3 id={`filter-${filterField}-heading`} className="text-sm font-semibold">{filterField[0].toLocaleUpperCase() + filterField.slice(1)}</h3>
            {headingExtra ?? null}
            <ResetButton disabled={!canReset} onClick={()=>resetFn()}>{resetLabel}</ResetButton>
        </div>
        {children}
    </section>
 }


const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>((props, _ref) => {
    
    // #region Set/Reset
    const setYear = useFilterContext(s=>s.setYear);
    const setCategories = useFilterContext(s=>s.setCategories);

    const resetFilter = useFilterContext(s=>s.resetFilter);
    const resetYear = useCallback((resetMin: boolean = true, resetMax: boolean = true)=>{
        const mask = (resetMin ? (resetMax ? FilterField.ALL_YEAR : FilterField.MIN_YEAR) : (resetMax ? FilterField.MAX_YEAR : null));
        if (mask !== null) resetFilter({mask});
    }, [resetFilter]);

    const setURLSyncFlag = useBrowserContext(s=>s.setURLSyncFlag);
    // const getURLSyncFlag = useBrowserContext(s=>s.getURLSyncFlag);
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
    const showYearSlider = useMemo(()=>props.rangeInfo.minYear !== props.rangeInfo.maxYear, [props.rangeInfo]);
    const yearSlider = <YearSlider value={yearValue} min={props.rangeInfo.minYear} max={props.rangeInfo.maxYear} defaultValue={[props.rangeInfo.minYear, props.rangeInfo.maxYear]}
        // onValueChange={(value: [number, number]) => props.dispatch({type: 'SET_YEAR', payload: value})}
        onValueChange={(value: [number, number])=>{
            console.log('value change:', value);
            setURLSyncFlag(URLSyncFlag.SUSPEND, true);
            setYear(value);
        }}
        onValueCommit={(value: [number, number]) => {
            console.log('value commit:', value);
            setURLSyncFlag(URLSyncFlag.DEFER, true);   
        }}
        // vocab=""
        color='green'
        disabled={!showYearSlider}
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
        <FilterFormSection filterField="year" resetFn={resetYear} canReset={canResetYear} 
            headingExtra={<YearValue minYear={year0} maxYear={year1} rangeMinYear={props.rangeInfo.minYear} rangeMaxYear={props.rangeInfo.maxYear}/>}
        >
            {yearSlider}
        </FilterFormSection>

        <FilterFormSection filterField="categories" resetFn={resetCategories} canReset={canResetCategories}>
            <WrappingToggleGroup type="multiple" variant="default" value={selectedCategories} onValueChange={setCategories}>
                {categoryNames.map(name=>{
                    const enabled = !selectedCategories.length || canToggleCategory(name, selectedCategories.includes(name));
                    return <WrappingToggleGroupItem key={name} value={name} disabled={!enabled} className="disabled:text-shadow-accent">{name[0].toLocaleUpperCase() + name.slice(1)}</WrappingToggleGroupItem>;
                })}
            </WrappingToggleGroup>
        </FilterFormSection>

        <FilterFormSection filterField="tags" resetFn={resetTags} canReset={canResetTags}>
            {tagSections}
        </FilterFormSection>
    </>;
});


export default FilterForm;