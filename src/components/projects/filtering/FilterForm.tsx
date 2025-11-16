import { forwardRef, useMemo, type Dispatch } from "react";
import type { FilterSheetProps } from "./FilterSheet";
// import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import TagFilterSection from "./sections/TagFilterSection";
import {Slider} from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { FilterAction, FilterRangeInfo, FilterState } from "./common/filterTypes";
import type { ProjectData, ProjectInfo } from "../types";

type SliderProps = React.ComponentProps<typeof Slider>;


type FilterFormProps = {
    projects: ProjectInfo[],
    state: FilterState,
    dispatch: Dispatch<FilterAction>,
    registerReset: (resetFn: ()=>void) => ()=>void,
} & FilterSheetProps;

export interface FilterFormHandle {};


export type TagType = ('lang' | 'topic' | 'skill');  // | 'concept');
const TAGTYPES: TagType[] = ['lang', 'skill', 'topic'];

const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>((props, ref) => {

    // Year slider
    const slider = <Slider min={props.rangeInfo.minYear} max={props.rangeInfo.maxYear} defaultValue={[props.rangeInfo.minYear, props.rangeInfo.maxYear]}
        onValueChange={(value: [number, number]) => props.dispatch({type: 'SET_YEAR', payload: value})}
        // vocab=""
        color='green'
        // minStepsBetweenThumbs={1}
        step={1}
        className={cn("w-[60%]", undefined)}
    ></Slider>

    // Tags

    const tagSections = useMemo( ()=>
        TAGTYPES.map((tt =>
            <TagFilterSection projects={props.projects} state={props.state} dispatch={props.dispatch} key={tt} tagType={tt} rangeInfo={props.rangeInfo} registerReset={props.registerReset}></TagFilterSection>
        ))
        // <Accordion type='multiple'>
        //     <AccordionHeader>
        //         Hello
        //         <AccordionTrigger>Trigger</AccordionTrigger>
        //     </AccordionHeader>

        //     <AccordionContent>
        //         {
        //             TAGTYPES.map((tt => (
        //                 <AccordionItem value={tt}>
                            
        //                 </AccordionItem>
        //             )))
        //         }
        //     </AccordionContent>
        // </Accordion>
    , [props.state, props.rangeInfo, props.dispatch]);

    return <>
        {slider}
        {tagSections}
    </>;
});


export default FilterForm;