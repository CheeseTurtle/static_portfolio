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


function* insertInSelectedBlock(tagBlock: string[], newTag: string, selectedTags?: Set<string> | undefined) {
    if(!tagBlock.length) {
        yield newTag;
        return;
    } else if(!selectedTags?.size) {
        yield newTag;
        for(const tag of tagBlock) {
            if(tag !== newTag) yield tag;
        }
        return;
    }
    let yieldedNew: boolean = false; 
    for(const tag of tagBlock) {
        if(!yieldedNew) {
            if(tag === newTag) {
                yieldedNew = true;
            } else if(!selectedTags.has(tag)) {
                yield newTag;
                yieldedNew = true;
            }
        } else if(tag === newTag)
            continue;
        yield tag;
    }
    if(!yieldedNew) yield newTag;
}

// function insertInSelectedBlock(tagBlock: string[], newTag: string, selectedTags: Set<string>) {
//     const n = tagBlock.length;
//     if(!n)
//         return [newTag];

//     let i = n;
//     while(i) {
//         i -= 1;
//         if(!selectedTags.has(tagBlock[i]))
//             break;
//     }
// }


export default function TagButtons(props: TagButtonsProps) {    
    const tagKey = useMemo(()=>getProjectKeyFromTagType(props.tagType), [props.tagType]);
    const availableTags = useMemo(() => Array.from(props.availableTags.values()), [props.availableTags]);

    // [selected tags, unselected tags]
    const [visualOrder, setVisualOrder] = useState<[string[],string[]]>([[],availableTags]);

    useEffect(()=>{
        console.log('Selected tags:', props.tagType, props.selectedTags);
    }, [props.selectedTags]);

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
                const newUnselected = unselected.filter(t => t !== tagText);
                // if(selected.includes(tagText))
                //     return [selected, newUnselected];                    
                // const newSelected = selected.includes(tagText) ? [...selected] : [...selected.filter(t=>t!==tagText), tagText];
                const newSelected = Array.from(insertInSelectedBlock(selected, tagText, props.selectedTags))
                return [newSelected, newUnselected];
            });
        }
        props.toggleTag(tagText);
    }, [props.toggleTag, props.selectedTags]);


    const sortTags = useCallback((tags: string[], inPlace: boolean = false) => {
        const tagCounts = Object.fromEntries(availableTags.map(tag=>[tag, props.projects.filter(p=>p.tags[tagKey]?.has(tag)).length]));
        return (inPlace ? tags : [...tags]).sort((a,b)=>tagCounts[b] - tagCounts[a]);
    }, [tagKey, availableTags, props.projects]);


    // // compute data-based ordering for all tags
    // const dataOrder = useMemo(() => {
    //     if (!props.projects) return availableTags;
    //     return [...availableTags].sort((a, b) => {
    //         const countA = props.projects.filter(p => p.tags[tagKey]?.has(a)).length;
    //         const countB = props.projects.filter(p => p.tags[tagKey]?.has(b)).length;
    //         return countB - countA;
    //     });
    // }, [availableTags, props.projects, tagKey]);

    const unselectedOrdered = useMemo(() => {
        const [, unselected] = visualOrder;
        if (!props.projects) return unselected;

        return sortTags(unselected, true);

        // return [...unselected].sort((a, b) => {
        //     const countA = props.projects.filter(p => p.tags[tagKey]?.has(a)).length;
        //     const countB = props.projects.filter(p => p.tags[tagKey]?.has(b)).length;
        //     return countB - countA;
        // });
    }, [visualOrder, props.projects, sortTags]);

    // final render order = selected first, then unselected (dynamically ordered)
    const renderOrder = useMemo(() => [...visualOrder[0], ...unselectedOrdered], 
        [visualOrder[0], unselectedOrdered]);


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
            setVisualOrder(vOrder => {
                const [selected, unselected] = vOrder;
                if(!selected.length) return vOrder;
                if(!unselected.length) return [sortTags(selected), unselected];

                const newUnselected = [...unselected.filter(x=>!props.selectedTags?.has(x))];
                const newSelected = selected.filter(tag=>{
                    if(props.selectedTags?.has(tag))
                        return true;
                    if(!newUnselected.includes(tag)) newUnselected.push(tag);
                    return false;
                });
                return [sortTags(newSelected, true), sortTags(newUnselected, true)]
            });
        });
        return unregister;
    }, [props.selectedTags, props.availableTags, setVisualOrder]);

    return <div data-role='tag-buttons'>
        {renderedChildren}
    </div>
}