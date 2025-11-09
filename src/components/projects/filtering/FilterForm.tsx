import { forwardRef, useMemo } from "react";
import type { FilterRangeInfo, FilterSheetProps, FilterSpec } from "./FilterSheet";
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import TagFilterSection from "./sections/TagFilterSection";
import {Slider} from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type SliderProps = React.ComponentProps<typeof Slider>;


type FilterFormProps = {
    filterSpec: FilterSpec,
    filterRangeInfo: FilterRangeInfo,
} & FilterSheetProps;

export interface FilterFormHandle {};


export type TagType = ('lang' | 'topic' | 'skill');  // | 'concept');
const TAGTYPES: TagType[] = ['lang', 'skill', 'topic'];

const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>((props, ref) => {

    // Year slider
    const slider = <Slider min={props.filterRangeInfo.minYear} max={props.filterRangeInfo.maxYear} defaultValue={[props.filterRangeInfo.minYear, props.filterRangeInfo.maxYear]}
        onValueChange={(value: number[]) => {
            props.setFilterSpec((oldSpec) => {
                const newSpec: FilterSpec = Object.fromEntries(Object.entries(oldSpec));
                newSpec['minYear'] = value[0];
                newSpec['maxYear'] = value[1];
                // console.log('New spec:', value, newSpec);
                return newSpec;
            });
        }}
        // vocab=""
        color='green'
        // minStepsBetweenThumbs={1}
        step={1}
        className={cn("w-[60%]", undefined)}
    ></Slider>

    // Tags

    const tagSections = useMemo( ()=>
        TAGTYPES.map((tt =>
            <TagFilterSection key={tt} filterSpec={props.filterSpec} tagType={tt} availableTags={props.filterRangeInfo[tt]} setSelectedTags={(tags: string[] | undefined) => {
                // props.setFilterSpec((oldSpec) => ({[tt]: (tags && tags.length > 0 ? tags : undefined), ...oldSpec}));
                let newSpec: FilterSpec | undefined;
                props.setFilterSpec((oldSpec) => {
                    newSpec = Object.fromEntries(Object.entries(oldSpec));
                    newSpec[tt] = (tags && tags.length > 0 ? tags : undefined);
                    return newSpec;
                });
                console.log('Set filter spec:', tags, newSpec);
            }}></TagFilterSection>
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
    , [props.filterSpec, props.filterRangeInfo]);

    return <>
        {slider}
        {tagSections}
    </>;
});


export default FilterForm;