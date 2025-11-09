import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, type ReactNode } from "react";
import type { TagType } from "../FilterForm";
import type { FilterSpec } from "../FilterSheet";
import TagButton from "../common/TagButton";
import TagButtons from "../common/TagButtons";



type TagFilterSectionProps = {
    tagType: TagType,
    filterSpec: FilterSpec,
    availableTags: Set<string>,
    setSelectedTags: (tags: string[] | undefined) => void
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
    

    // const toggleFilterStatus = useCallback((tagText: string, pressed?: boolean) => {
    //     const newTags: string[] | undefined = (() => {
    //         if(pressed === undefined) {
    //             if(selectedTags && selectedTags.length > 0) {
    //                 const idx = selectedTags.indexOf(tagText);
    //                 if(idx > -1) {
    //                     // if(selectedTags.length == 1)
    //                     //     return undefined;
    //                     selectedTags.splice(idx, 1);
    //                 } else {
    //                     selectedTags.push(tagText);
    //                 }
    //             } else {
    //                 return [tagText];
    //             }
    //         } else if(pressed) {
    //             if(selectedTags && selectedTags.length > 0)
    //                 selectedTags.push(tagText);
    //             else
    //                 return [tagText];
    //         } else if(selectedTags && selectedTags.length > 0) {
    //             const idx = selectedTags.indexOf(tagText);
    //             if(idx > -1) {
    //                 // if(selectedTags.length == 1)
    //                 //     return undefined;
    //                 selectedTags.splice(idx, 1);
    //             }
    //         }
    //         return selectedTags;
    //     })();
    //     props.setSelectedTags(newTags);
    // }, [selectedTags, props.filterSpec, props.tagType, props.setSelectedTags]);

    // const handleRef = useRef<TagFilterSectionHandle>({toggleFilterStatus});

    // useImperativeHandle(ref, () => handleRef.current, []);

    return <div data-role='tag-filter-section' data-tag-type={props.tagType}>    
        <h3>{sectionTitle}</h3>
        <TagButtons tagType={props.tagType} availableTags={props.availableTags} colorClassName={colorClassName} setSelectedTags={props.setSelectedTags}></TagButtons>
    </div>
});

export default TagFilterSection;