import React, { forwardRef, type ReactNode } from "react";
import type { FilterSheetProps } from "./FilterSheet";
// import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import TagFilterSection from "./sections/TagFilterSection2";
// import {Slider} from "@/components/ui/slider";
import YearSlider from "@/components/projects/filtering/sections/YearSlider";
import type { ProjectInfo } from "../types";
import { useBrowserContext, useFilterContext } from "./common/browserContext";
import ResetButton from "./common/ResetButton";
import YearValue from "./sections/YearValue";
import { URLSyncFlag } from "./common/stores/browserStore";
import { WrappingToggleGroup, WrappingToggleGroupItem } from "./common/WrappingToggleGroup";
import { useFilterFormStore } from "./common/stores/filterFormStoreContext";

type FilterFormProps = {
    projects: ProjectInfo[],
    registerReset: (resetFn: ()=>void) => ()=>void,
    inSheet?: boolean,
} & FilterSheetProps;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FilterFormHandle {};

export type TagType = ('lang' | 'topic' | 'skill');  // | 'concept');
// const TAGTYPES: TagType[] = ['lang', 'skill', 'topic'];


type FilterFormSectionProps = {
    filterField: 'categories' | 'year' | 'tags';
    headingExtra?: ReactNode,
    children: ReactNode,
    canReset: boolean,
    resetFn: () => void,
};






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

    const resetYear = useFilterContext(s=>s.resetYear);

    const setURLSyncFlag = useBrowserContext(s=>s.setURLSyncFlag);
    // const getURLSyncFlag = useBrowserContext(s=>s.getURLSyncFlag);
    const resetCategories =useFilterContext(s=>s.resetCategories);
    
    const resetTags = useFilterContext(s=>s.resetTags);

    // #endregion
    
    // #region Values
    const yearValue = useFilterContext(s=>s.yearValue);
    const [year0, year1] = yearValue;

    const categoryNames = props.rangeInfo.categoryNames;

    // const selectedCategoriesSet = useFilterContext(state=>state.categories, (a,b)=>(a.size === b.size && [...a].every(x=>b.has(x))));
    const selectedCategories = useFilterContext(s=>s.selectedCategories);
    
    // const selectedTags = useFilterContext(s=>s.tags);
    // #endregion


    const canResetYear = useFilterContext(s=>s.canResetYear);
    const canResetCategories = useFilterContext(s=>s.canResetCategories);
    const canResetTags = useFilterContext(s=>s.canResetTags);
    const canToggleCategory = useFilterContext(s=>s.canToggleCategory);
    

    // #region Year slider
    const showYearSlider = useFilterFormStore(s=>s.showYearSlider);
    const onValueChange = React.useCallback((value: [number, number])=>{
        console.log('value change:', value);
        setURLSyncFlag(URLSyncFlag.SUSPEND, true);
        setYear(value);
    }, [setURLSyncFlag, setYear])
    const onValueCommit = React.useCallback((value: [number, number]) => {
        console.log('value commit:', value);
        setURLSyncFlag(URLSyncFlag.DEFER, true);   
    }, [setURLSyncFlag])
    const yearSlider = <YearSlider value={yearValue} min={props.rangeInfo.minYear} max={props.rangeInfo.maxYear} defaultValue={[props.rangeInfo.minYear, props.rangeInfo.maxYear]}
        onValueChange={onValueChange} onValueCommit={onValueCommit}
        // vocab=""
        // color='green'
        disabled={!showYearSlider}
        // minStepsBetweenThumbs={1}
        step={1}
        className="w-[60%]"
    ></YearSlider>
    // #endregion

    // #region Tags
    

    // const tagSections = useMemo( ()=>
    //     TAGTYPES.map((tt =>
    //         <TagSectionStoreProvider key={tt} projects={props.projects} tagType={tt} reset={()=>resetTags(tt)} filterStore={filterStore} countStore={countStore} rangeInfo={props.rangeInfo} registerReset={props.registerReset}>
    //             <TagFilterSection key={tt} tagType={tt} rangeInfo={props.rangeInfo} registerReset={props.registerReset}/>
    //         </TagSectionStoreProvider>
    //     ))
    // , [props.projects, props.rangeInfo, props.registerReset, filterStore, countStore, resetTags]);

    const tagSectionStores = useFilterFormStore(s=>s.tagSectionStores);
    const tagSections = React.useMemo(()=>
        Object.entries(tagSectionStores).map(([tt, store])=>
            <TagFilterSection key={tt} tagType={tt as TagType} store={store} />
        )
    , [tagSectionStores]);
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