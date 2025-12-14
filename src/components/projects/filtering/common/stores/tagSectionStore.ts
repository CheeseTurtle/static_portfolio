import type { ProjectInfo } from "@/components/projects/types";
import { getProjectKeyFromTagType, type FilterRangeInfo, type TagType } from "../filterTypes";
import { computeTagOrders as computeTagOrders_, type CountStore, type CountStoreState } from "./countStore";
import { createStore, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import React from "react";
import type { FilterStore } from "./filterStore";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";


export type TagSectionStoreInitProps = {
    countStore: CountStore,
    projects: ProjectInfo[],
    tagType: TagType,
    rangeInfo: FilterRangeInfo,
    registerReset: (resetFn: ()=>void) => ()=>void,
    reset: () => void,
    filterStore: FilterStore,
}

export type TagSectionStoreProps = {
    readonly projects: ProjectInfo[],
    readonly tagType: TagType,
    readonly rangeInfo: FilterRangeInfo,
    readonly registerReset: (resetFn: ()=>void) => ()=>void,
    readonly reset: () => void,

    readonly colorClassName: string,
    readonly availableTags: Set<string>,
    readonly selectedTags: Set<string> | undefined,
    readonly canReset: boolean,

    readonly useOr: boolean,

    counts: {[key: string]: number},
    // readonly _unselectedOrdered: string[],
    readonly visualOrder: [string[], string[]],

    readonly renderOrder: string[], // from visualOrder and unselectedOrdered
}

type TagSectionStoreActions = {
    toggleTag: (tagText: string, isPressed: boolean)=>void,
    // computeTagOrders: CountStoreState['computeTagOrders'],
    computeTagOrders: (tags: string[], inPlace?: boolean) => ReturnType<CountStoreState['computeTagOrders']>,

    canToggleTag: (tagText: string, currentlyActive: boolean) => boolean,

}


export type TagSectionStoreState = TagSectionStoreProps & TagSectionStoreActions;
export type TagSectionStore = ReturnType<typeof createTagSectionStore>;






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


type VisualOrder = [string[], string[]]
// type DispatchSetStateAction<T> = React.Dispatch<React.SetStateAction<T>>
// type DispatchSetStateActionParameters<T> = Parameters<DispatchSetStateAction<T>>



export const createTagSectionStore = ({countStore, filterStore, projects, rangeInfo, registerReset, reset, tagType}: TagSectionStoreInitProps) => {
    const colorClassName = getSectionColors(tagType);
    
    const [_singular, plural] = getSectionWords(tagType);
    const sectionTitle = plural.slice(0,1).toUpperCase() + plural.slice(1);

    const availableTagsSet = React.useMemo(() => rangeInfo[tagType], [rangeInfo, tagType]);
    const availableTags = React.useMemo(()=>Array.from(availableTagsSet), [availableTagsSet]);


    return createStore<TagSectionStoreState>()(subscribeWithSelector((set,get,api)=>{
        function computeTagOrders(tags: string[], inPlace?: boolean) {
            const counts = get().counts;
            return computeTagOrders_(tags, counts, inPlace)
        }
        function updateVisualOrderFromAvailableTags([selected, _unselected]: [string[], string[]], availableTags: string[]) {
            const newUnselected = computeTagOrders(availableTags.filter(x=>!selected.includes(x)), true)[1];
            // console.log('(On mount / availableTags changed) Setting visual order (updating newUnselected):', [selected, newUnselected]);
            return [selected.filter(x=>availableTags.includes(x)), newUnselected] as [string[], string[]];
        }


        filterStore.subscribe(s=>s.tags?.[tagType], (selectedTags)=>{
            set({
                selectedTags,
                canReset: Boolean(selectedTags?.size)
            })
        }, {
            equalityFn: (a, b) => {
                // if(!((a && a.size) || (b && b.size)))
                //     return true;
                if(a?.size && b?.size)
                    return a.size === b.size && [...a].every(x=>b.has(x));
                return !a?.size && !b?.size;
            }
        });

        countStore.subscribe(s=>s.current.tagCounts[tagKey], counts=>{
            set({ counts })
        }, {equalityFn: (a,b)=>{
            const bKeys = new Set<string>(Object.keys(b));
            if(Object.entries(a).some(([k,v])=>(bKeys.delete(k) ? b[k] : 0) !== v))
                return false;
            if(bKeys.size && [...bKeys].some(k=>b[k]))
                return false;
            return true;
        }})

        const toggleTag_ = useStoreWithEqualityFn(filterStore, s=>s.toggleTag);
        const propsToggleTag = React.useCallback((tagText: string) => toggleTag_(tagType, tagText), [toggleTag_]);
        
        const setTagMode = useStore(filterStore, s=>s.setTagMode);

        const tagKey = getProjectKeyFromTagType(tagType);

        api.subscribe(s=>s.useOr, useOr => {
            setTagMode(tagType, Number(useOr))
        })

        api.subscribe(s=>({visualOrder: s.visualOrder, counts: s.counts}), ({visualOrder: [selected, unselected], counts})=>{
            const unselectedOrdered = computeTagOrders_(unselected, counts, false)[1]
            set({renderOrder: [...selected, ...unselectedOrdered]})
        })

        const setVisualOrder: React.Dispatch<React.SetStateAction<VisualOrder>> = (valueOrSetter) => {
            if(typeof valueOrSetter === 'function')
                set((state)=>{
                    const newVisualOrder = valueOrSetter(state.visualOrder);
                    return {visualOrder: newVisualOrder}
                })
            else
                set({visualOrder: valueOrSetter})
        }
        const initialCounts = countStore.getState().current.tagCounts[tagKey]

        const initialTagOrder = computeTagOrders_(availableTags, initialCounts, false)[1]

        const initialVisualOrder = updateVisualOrderFromAvailableTags([[], initialTagOrder], availableTags)

        return {
            tagType, rangeInfo, projects, sectionTitle, availableTags: availableTagsSet, colorClassName,
            selectedTags: undefined,
            canReset: false,
            useOr: false,

            counts: initialCounts,
            visualOrder: initialVisualOrder,
            renderOrder: initialTagOrder,

            setTagMode,

            setUseOr: (useOr: boolean) => set({useOr}),

            registerReset, reset,
            computeTagOrders,

            canToggleTag(tagText, currentlyActive) {
                return currentlyActive || get().counts[tagText] > 0
            },

            toggleTag(tagText: string, isPressed: boolean) {
                if (isPressed) {
                    const selectedTags = get().selectedTags;
                    setVisualOrder(([selected, unselected]) => {
                        const newSelected = selected.filter(x=>selectedTags?.has(x));
                        const moveToUnselected = (newSelected.length ? ((newSelected.length === selected.length) ? [] : selected.filter(x=>x!==tagText && !selectedTags?.has(x))) : Array.from(selected.filter(x=>x!==tagText)));
                        const newUnselected = computeTagOrders([...moveToUnselected, ...unselected.filter(x=>x!==tagText),], true)[1];
                        // console.log(`(toggleTag :: "${tagText}" is now ${isPressed ? 'pressed' : 'unpressed'}) Setting visual order:`, [[...newSelected, tagText], newUnselected], {selected, newSelected, moveToUnselected, unselected});
                        return [[...newSelected, tagText], newUnselected];
                    });
                } else {
                    setVisualOrder(([selected, unselected]) => {
                        const newUnselected = unselected.includes(tagText) ? unselected : computeTagOrders([tagText, ...unselected], true)[1];
                        return [selected.filter(x=>x!==tagText), newUnselected];
                    })
                }
                propsToggleTag(tagText);
          }
        }
    }))
}