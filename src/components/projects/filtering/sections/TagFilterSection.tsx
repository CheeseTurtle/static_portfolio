import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Dispatch, type ReactNode } from "react";
import type { TagType } from "../FilterForm";
import type { FilterSpec } from "../FilterSheet";
import TagButton from "../common/TagButton";
import TagButtons from "../common/TagButtons";
import type { FilterAction, FilterRangeInfo, FilterState } from "../common/filterTypes";
import type { ProjectInfo } from "../../types";
import { useFilterContext } from "../common/browserContext";
import { shallow } from "zustand/shallow";
import { Button } from "@/components/ui/button";
import ResetButton from "../common/ResetButton";



type TagFilterSectionProps = {
    projects: ProjectInfo[],
    tagType: TagType,
    // state: FilterState,
    // dispatch: Dispatch<FilterAction>,
    // filterSpec: FilterSpec,
    // availableTags: Set<string>,
    rangeInfo: FilterRangeInfo,
    registerReset: (resetFn: ()=>void) => ()=>void,
    // setSelectedTags: (tags: string[] | undefined) => void,
    reset: () => void,
};



function getSectionWords(tt: TagType): [string, string] {
    switch(tt) {
        case 'lang':
            return ['language', 'languages'];
        case 'skill':
            return ['skill', 'skills'];
        case 'topic':
            return ['topic', 'topics'];
        default:
            throw TypeError();
    }
}



function getSectionColors(tt: TagType): string {
    switch(tt) {
        case 'lang':
            return 'bg-green-500 text-white hover:bg-green-600';
        case 'skill':
            return "bg-blue-500 text-white hover:bg-blue-600";
        case 'topic':
            return "bg-gray-500 text-white hover:bg-gray-600";
        // case 'concept':
        //     return "bg-red-500 text-white hover:bg-red-600";
        default:
            throw TypeError();
    }
}

interface TagFilterSectionHandle {
    toggleFilterStatus: (tagText: string) => void,
};



const TagFilterSection = forwardRef<TagFilterSectionHandle, TagFilterSectionProps>((props: TagFilterSectionProps, ref) => {

    // const selectedTags = useMemo(()=>(
    //     props.filterSpec[props.tagType]
    // ), [props.filterSpec, props.tagType]);

    const [singular, plural] = getSectionWords(props.tagType);
    
    const sectionTitle = plural.slice(0,1).toUpperCase() + plural.slice(1);
    
    const colorClassName = getSectionColors(props.tagType);
    
    const availableTags = useMemo(() => props.rangeInfo[props.tagType], [props.rangeInfo, props.tagType]);
    
    const selectedTags = useFilterContext(s=>s.tags, (a_, b_) => {
        const a = a_?.[props.tagType];
        const b = b_?.[props.tagType];
        // if(!((a && a.size) || (b && b.size)))
        //     return true;
        if(a?.size && b?.size) {
            return a.size === b.size && Array.prototype.every.call(a, (x=>b.has(x)));
        }
        return !a?.size && !b?.size;
    })?.[props.tagType];

    //   useEffect(()=>{
    //     console.log('Selected tags:', props.tagType, selectedTags);
    // }, [selectedTags]);
    // const selectedTags = useMemo(()=>props.filterSpec.tags[props.tagType], [props.filterSpec.tags[props.tagType], props.tagType]);

    const toggleTag_ = useFilterContext(s=>s.toggleTag, shallow);
    const toggleTag = useCallback((tagText: string) => toggleTag_(props.tagType, tagText), [props.tagType]);

    return <div data-role='tag-filter-section' data-tag-type={props.tagType}>    
        <div className="inline-flex">
            <h3>{sectionTitle}</h3>
            <ResetButton onClick={()=>props.reset()}>Reset</ResetButton>
        </div>
        <TagButtons projects={props.projects} tagType={props.tagType} availableTags={availableTags} colorClassName={colorClassName} toggleTag={toggleTag} selectedTags={selectedTags} registerReset={props.registerReset}></TagButtons>
    </div>
});

export default TagFilterSection;