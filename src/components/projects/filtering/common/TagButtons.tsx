import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactElement, type ReactNode, type Ref, type RefObject, type SetStateAction } from "react";
import TagButton, { type TagButtonProps } from "./TagButton";
import type { TagType } from "../FilterForm";
import type { ProjectData, ProjectInfo } from "../../types";
import { getProjectKeyFromTagType } from "./filterTypes";

type TagButtonsProps = {
    colorClassName?: string,
    selectedTags: Set<string> | undefined,
    availableTags: Set<string>,
    projects: ProjectInfo[],
    tagType: TagType,
    toggleTag: (tagText: string) => void,
    registerReset: (resetFn: () => void) => () => void
};


function moveToEnd(arr: string[], item: string): string[] {
    const idx = arr.indexOf(item);
    if(idx === -1 || idx === arr.length - 1) 
        return arr; // No change!
    arr.splice(idx, 1)
    return arr.concat([item]);
}


function markSelected(pair: [string[], string[]], item: string): [string[], string[]] {
    const [selected, unselected] = pair;
    const idx = unselected.indexOf(item);
    if(idx === -1) {
        if(selected.includes(item)) // No change
            return pair;
        return [[...selected, item], unselected];
    } else { // No change to selected
        const arr = (idx > 0 ? unselected.slice(0, idx) : []);
        const idx1 = idx + 1;
        return [(selected.includes(item) ? selected : [...selected, item]), ((idx1 < unselected.length) ? arr.concat(unselected.slice(idx1)) : arr)];
    }
}

export default function TagButtons(props: TagButtonsProps) {    
    const tagKey = useMemo(()=>getProjectKeyFromTagType(props.tagType), [props.tagType]);
    const availableTags = useMemo(() => Array.from(props.availableTags.values()), [props.availableTags]);
    const [visualOrder, setVisualOrder] = useState<[string[],string[]]>([[],availableTags]);
    

    // update visualOrder on mount or when availableTags changes
    useEffect(() => {
        setVisualOrder(([selected, _unselected]) => [selected, availableTags.filter(x=>!selected.includes(x))]);
    }, [availableTags]);


    // const toggleTag = useCallback((tagText: string, isPressed: string) => {
    //     if(isPressed) {
    //         // We are now selected -- move to end of `visualOrder`
    //         setVisualOrder((pair) => markSelected(pair, tagText));
    //     }
    //     props.toggleTag(tagText);
    // }, [props.toggleTag, setVisualOrder]);
    const toggleTag = useCallback((tagText: string, isPressed: boolean) => {
        if (isPressed) {
            setVisualOrder(([selected, unselected]) => {
                const newSelected = [...selected, tagText];
                const newUnselected = unselected.filter(t => t !== tagText);
                return [newSelected, newUnselected];
            });
        }
        props.toggleTag(tagText);
    }, [props.toggleTag]);


    // compute data-based ordering for all tags
    const dataOrder = useMemo(() => {
        if (!props.projects) return availableTags;
        return [...availableTags].sort((a, b) => {
            const countA = props.projects.filter(p => p.tags[tagKey]?.has(a)).length;
            const countB = props.projects.filter(p => p.tags[tagKey]?.has(b)).length;
            return countB - countA;
        });
    }, [availableTags, props.projects, props.tagType]);

    const unselectedOrdered = useMemo(() => {
        const [, unselected] = visualOrder;
        if (!props.projects) return unselected;

        return [...unselected].sort((a, b) => {
            const countA = props.projects.filter(p => p.tags[tagKey]?.has(a)).length;
            const countB = props.projects.filter(p => p.tags[tagKey]?.has(b)).length;
            return countB - countA;
        });
    }, [visualOrder, props.projects, props.tagType]);

    // final render order = selected first, then unselected (dynamically ordered)
    const renderOrder = useMemo(() => [...visualOrder[0], ...unselectedOrdered], [visualOrder, unselectedOrdered]);


    const availableChildren: Record<string, ReactElement<TagButtonProps>> = useMemo(()=>Object.fromEntries(
        availableTags.map(
            tagText => [tagText, 
                <TagButton key={tagText} colorClassName={props.colorClassName} isPressed={props.selectedTags ? props.selectedTags.has(tagText) : false} tagText={tagText} toggleTag={toggleTag}></TagButton>
            ]
        )
    ), [availableTags, toggleTag, props.selectedTags]);

    // const selectedChildren = useMemo(
    //     () => props.selectedTags.map(tagText=>availableChildren[tagText]), [props.selectedTags, availableChildren]
    // );

    const renderedChildren = useMemo(() => renderOrder.map(tagText => availableChildren[tagText]), [renderOrder, availableChildren]);


    // const orderedChildren = useMemo(
    //     ()=>visualOrder.flatMap(tags=>tags.map(tagText=>availableChildren[tagText])),
    //     [availableChildren, visualOrder]
    // );

    useEffect(() => {
        const unregister = props.registerReset(()=>{
            
        });
        return unregister;
    }, [props.selectedTags, props.availableTags, setVisualOrder]);

    return <div data-role='tag-buttons'>
        {renderedChildren}
    </div>
}