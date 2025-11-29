import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import type { TagType } from "../FilterForm";
import TagButtons from "../common/TagButtons";
import type { FilterRangeInfo } from "../common/filterTypes";
import type { ProjectInfo } from "../../types";
import { useFilterContext } from "../common/browserContext";
import { shallow } from "zustand/shallow";
import ResetButton from "../common/ResetButton";
// import { Ampersand } from "lucide-react";
import BoolSwitch from "./BoolSwitch";



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
            return 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-100';
        case 'skill':
            return "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-100";
        case 'topic':
            return "bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-100";
        // case 'concept':
        //     return "bg-red-500 text-white hover:bg-red-600";
        default:
            throw TypeError();
    }
}

interface TagFilterSectionHandle {
    toggleFilterStatus: (tagText: string) => void,
};



const TagFilterSection = forwardRef<TagFilterSectionHandle, TagFilterSectionProps>((props: TagFilterSectionProps, _ref) => {

    const [_singular, plural] = getSectionWords(props.tagType);
    
    const sectionTitle = plural.slice(0,1).toUpperCase() + plural.slice(1);
    
    const colorClassName = getSectionColors(props.tagType);
    
    const availableTags = useMemo(() => props.rangeInfo[props.tagType], [props.rangeInfo, props.tagType]);
    
    const selectedTags = useFilterContext(s=>s.tags, (a_, b_) => {
        const a = a_?.[props.tagType];
        const b = b_?.[props.tagType];
        // if(!((a && a.size) || (b && b.size)))
        //     return true;
        if(a?.size && b?.size) {
            return a.size === b.size && [...a].every(x=>b.has(x));
        }
        return !a?.size && !b?.size;
    })?.[props.tagType];

    const canReset = Boolean(selectedTags?.size);

    //   useEffect(()=>{
    //     console.log('Selected tags:', props.tagType, selectedTags);
    // }, [selectedTags]);
    // const selectedTags = useMemo(()=>props.filterSpec.tags[props.tagType], [props.filterSpec.tags[props.tagType], props.tagType]);

    const toggleTag_ = useFilterContext(s=>s.toggleTag, shallow);
    const toggleTag = useCallback((tagText: string) => toggleTag_(props.tagType, tagText), [props.tagType, toggleTag_]);

    
    // return <div data-role='tag-filter-section' data-tag-type={props.tagType}>    
    //     <div className="inline-flex">
    //         <h3>{sectionTitle}</h3>
    //         <ResetButton onClick={()=>props.reset()}>Reset</ResetButton>
    //     </div>
    //     <TagButtons projects={props.projects} tagType={props.tagType} availableTags={availableTags} colorClassName={colorClassName} toggleTag={toggleTag} selectedTags={selectedTags} registerReset={props.registerReset}></TagButtons>
    // </div>
    //  return <div className={`filter-tag-section space-y-0 mb-5`}>
    //     <div className="space-y-1 inline-flex">
    //         <div role="heading" aria-level={4} className="text-sm font-semibold">{filterField[0].toLocaleUpperCase() + filterField.slice(1)}</div>
    //         {headingExtra ?? null}
    //         <ResetButton onClick={()=>resetFn()}>{resetLabel}</ResetButton>
    //     </div>
    //     {children}
    // </div>   

    const [useOr, setUseOr] = useState<boolean>(false);
    const setTagMode = useFilterContext(s=>s.setTagMode);
    useEffect(()=>{
        setTagMode(props.tagType, Number(useOr));
    }, [useOr, props.tagType, setTagMode]);

    return <div role="group" aria-labelledby="languages-label" className="space-y-0 mb-5" data-role='tag-filter-section' data-tag-type={props.tagType}>
        <div className="inline-flex items-baseline">
            <span id="languages-label" className="text-xs font-semibold" role="heading" aria-level={4}>
                {sectionTitle}
            </span>
            <ResetButton disabled={!canReset} onClick={()=>props.reset()}>Reset</ResetButton>
            {/* <Toggle pressed={useOr} onPressedChange={setUseOr} className="text-xs h-[1em] m-0">
                MATCH {useOr ? 'ANY' : 'ALL'}
            </Toggle> */}
            <BoolSwitch checked={useOr} onCheckedChange={setUseOr}></BoolSwitch>
        </div>
        <TagButtons projects={props.projects} tagType={props.tagType} availableTags={availableTags} colorClassName={colorClassName} toggleTag={toggleTag} selectedTags={selectedTags} registerReset={props.registerReset}></TagButtons>
    </div>;
});

export default TagFilterSection;