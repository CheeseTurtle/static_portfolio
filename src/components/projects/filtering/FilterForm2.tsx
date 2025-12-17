import React, { type ReactNode } from "react";
// import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import TagFilterSection from "./sections/TagFilterSection2";
// import {Slider} from "@/components/ui/slider";
import YearSlider from "@/components/projects/filtering/sections/YearSlider";
import { useBrowserContext, useFilterContext, useFilterStore } from "./common/browserContext";
import ResetButton from "./common/ResetButton";
import YearValue from "./sections/YearValue";
import { URLSyncFlag } from "./common/stores/browserStore";
import { WrappingToggleGroup, WrappingToggleGroupItem } from "./common/WrappingToggleGroup";
import { useFilterFormStore, useFilterFormStoreContext } from "./common/stores/filterFormStoreContext";
import { TagSectionStoreProvider } from "./common/stores/FilterFormStoreProvider";
import { shallow } from "zustand/shallow";
import { useCountStore } from "./common/stores/countStore";
import { createRecordFromObject } from "@/lib/objutil";

type FilterFormProps = {
    inSheet?: boolean,
}; // & FilterSheetProps;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FilterFormHandle {};

export type TagType = ('lang' | 'topic' | 'skill');  // | 'concept');


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


const FilterForm = (({
    inSheet: _inSheet
}: FilterFormProps ) => {

    const rangeInfo = useFilterContext(s=>s.filterRangeInfo);
    // const {tagSectionStores, filterFormStore} = useFilterFormStoreContext();

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
    const yearValue = useFilterFormStore(s=>s.yearValue, shallow);
    const [year0, year1] = yearValue;

    console.log('yearValue:', yearValue)

    const categoryNames = rangeInfo.categoryNames;

    // const selectedCategoriesSet = useFilterContext(state=>state.categories, (a,b)=>(a.size === b.size && [...a].every(x=>b.has(x))));
    const selectedCategories = useFilterFormStore(s=>s.selectedCategories);
    
    // const selectedTags = useFilterContext(s=>s.tags);
    // #endregion


    const canResetYear = useFilterFormStore(s=>s.canResetYear);
    const canResetCategories = useFilterFormStore(s=>s.canResetCategories);
    const canResetTags = useFilterFormStore(s=>s.canResetTags);
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
    const yearSlider = <YearSlider min={rangeInfo.minYear} max={rangeInfo.maxYear} defaultValue={[rangeInfo.minYear, rangeInfo.maxYear]}
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

    const countStore = useCountStore()
    const filterStore = useFilterStore()
    // const registerReset = useStore(filterFormStore, s=>s.registerReset);
    const registerReset = useFilterFormStore(s=>s.registerReset);

    const {tagSectionStores} = useFilterFormStoreContext();
    
    const tagSections = Object.entries(tagSectionStores).map(([tt, ref])=>
        <TagSectionStoreProvider storeRef={ref} key={tt} tagType={tt as TagType} countStore={countStore} filterStore={filterStore} rangeInfo={rangeInfo} registerReset={registerReset} reset={()=>resetTags(tt as TagType)}>
            <TagFilterSection key={tt} tagType={tt as TagType} />
        </TagSectionStoreProvider>
    )

    // const tagSections = React.useRef<Partial<Record<TagType, React.JSX.Element>>>({});
    // tagSections.current = createRecordFromObject(tagSectionStores, ([tt,ref])=> (
    //     tagSections.current[tt] ?? (
    //         <TagSectionStoreProvider storeRef={ref} key={tt} tagType={tt as TagType} countStore={countStore} filterStore={filterStore} rangeInfo={rangeInfo} registerReset={registerReset} reset={()=>resetTags(tt as TagType)}>
    //             <TagFilterSection key={tt} tagType={tt as TagType} />
    //         </TagSectionStoreProvider>
    //     )))

    // #endregion


    return <>
        <FilterFormSection filterField="year" resetFn={resetYear} canReset={canResetYear} 
            headingExtra={<YearValue minYear={year0} maxYear={year1} rangeMinYear={rangeInfo.minYear} rangeMaxYear={rangeInfo.maxYear}/>}
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
            {/* {Object.values(tagSections.current)} */}
            {tagSections}
        </FilterFormSection>
    </>;
});


export default FilterForm;