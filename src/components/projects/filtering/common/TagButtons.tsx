import React, { useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState, type Dispatch, type ReactElement, type ReactNode, type Ref, type RefObject, type SetStateAction } from "react";
import TagButton, { type TagButtonProps } from "./TagButton";
import type { TagType } from "../FilterForm";
import type { ProjectData, ProjectInfo } from "../../types";
import { getProjectKeyFromTagType } from "./filterTypes";
import { useBrowserContext, useFilterContext } from "./browserContext";
import { useCountContext } from "./stores/countStoreContext";

import { Flip } from "gsap/Flip";
import {gsap} from "gsap";

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



export default function TagButtons(props: TagButtonsProps) {    
    const tagKey = useMemo(()=>getProjectKeyFromTagType(props.tagType), [props.tagType]);
    const availableTags = useMemo(() => Array.from(props.availableTags.values()), [props.availableTags]);

    gsap.registerPlugin(Flip);

    // [selected tags, unselected tags]
    const [visualOrder, setVisualOrder] = useState<[string[],string[]]>([[],availableTags]);

    const visibleProjects = useBrowserContext(s=>s.visibleProjects);

    const counts = useCountContext(s=>s.current.tagCounts[tagKey], (a,b)=>{
        const bKeys = new Set<string>(Object.keys(b));
        if(Object.entries(a).some(([k,v])=>(bKeys.delete(k) ? b[k] : 0) !== v))
            return false;
        if(bKeys.size && [...bKeys].some(k=>b[k]))
            return false;
        return true;
    });
    const computeTagOrders = useCountContext(s=>s.computeTagOrders);
    
    const computeTagOrdersSafe = useCallback((tags: string[], inPlace?: boolean) => {
        console.log('Using counts to compute new tag orders:', counts);
        return computeTagOrders(tags, counts, inPlace);
    }, [counts, computeTagOrders]);


    // useEffect(()=>{
    //     console.log('Selected tags:', props.tagType, props.selectedTags);
    // }, [props.selectedTags]);

    // update visualOrder on mount or when availableTags changes
    useEffect(() =>
        setVisualOrder(([selected, _unselected]) => {
            const newUnselected = computeTagOrdersSafe(availableTags.filter(x=>!selected.includes(x)), true)[1];
            console.log('(On mount / availableTags changed) Setting visual order (updating newUnselected):', [selected, newUnselected]);
            return [selected, newUnselected];
    }), [availableTags]);

    // useEffect(()=>
    //       setVisualOrder(([selected, unselected]) => {
    //         const newUnselected = computeTagOrdersSafe(unselected.filter(x=>!props.selectedTags?.has(x)), true)[1];
    //         const newSelected = props.selectedTags ? [...props.selectedTags] : [];
    //         return [computeTagOrdersSafe(newSelected, true)[1], computeTagOrdersSafe(newUnselected, true)[1]];
    // }), [props.selectedTags]);


    const toggleTag = useCallback((tagText: string, isPressed: boolean) => {
        if (isPressed) {
            // setVisualOrder(([selected, unselected]) => {
            //     const newUnselected = unselected.filter(t => t !== tagText);
            //     const newSelected = Array.from(insertInSelectedBlock(selected, tagText, props.selectedTags));
            //     console.log(`(toggleTag :: "${tagText}" is now ${isPressed ? 'pressed' : 'unpressed'}) Setting visual order:`, [newSelected, newUnselected]);
            //     return [newSelected, newUnselected];
            // });
            setVisualOrder(([selected, unselected]) => {
                const newSelected = selected.filter(x=>props.selectedTags?.has(x));
                const moveToUnselected = (newSelected.length ? ((newSelected.length === selected.length) ? [] : selected.filter(x=>x!==tagText && !props.selectedTags?.has(x))) : Array.from(selected.filter(x=>x!==tagText)));
                const newUnselected = computeTagOrdersSafe([...(moveToUnselected as string[]), ...unselected.filter(x=>x!==tagText),], true)[1];
                console.log(`(toggleTag :: "${tagText}" is now ${isPressed ? 'pressed' : 'unpressed'}) Setting visual order:`, [[...newSelected, tagText], newUnselected], {selected, newSelected, moveToUnselected, unselected});
                return [[...newSelected, tagText], newUnselected];
            });
        } else {
            setVisualOrder(([selected, unselected]) => {
                const newUnselected = unselected.includes(tagText) ? unselected : computeTagOrdersSafe([tagText, ...unselected], true)[1];
                return [selected.filter(x=>x!==tagText), newUnselected];
            })
        }
        props.toggleTag(tagText);
    }, [props.toggleTag, props.selectedTags]);

    // const canToggleTag_ = useFilterContext(s=>s.canToggleTag);
    // const canToggleTag = useCallback((tagText: string, currentlyActive: boolean)  => canToggleTag_(tagKey, tagText, currentlyActive, visibleProjects), [visibleProjects, canToggleTag_]);

    const canToggleTag = useCallback((tagText: string, currentlyActive: boolean) => currentlyActive || counts[tagText], [counts]);

    // const sortTags = useCallback((tags: string[], inPlace: boolean = false) => {
    //     const tagCounts = Object.fromEntries(availableTags.map(tag=>[tag, props.projects.filter(p=>p.tags[tagKey]?.has(tag)).length]));
    //     return (inPlace ? tags : [...tags]).sort((a,b)=>tagCounts[b] - tagCounts[a]);
    // }, [tagKey, availableTags, props.projects]);


    const unselectedOrdered = useMemo(() => {
        const [, unselected] = visualOrder;
        // if (!props.projects) return unselected;

        // return sortTags(unselected, true);
        const ret = computeTagOrdersSafe(unselected, false)[1];
        console.log('Updating memoed unselectedOrdered', unselected, ret);
        return ret;
    }, [visualOrder[1], computeTagOrdersSafe]);

    // final render order = selected first, then unselected (dynamically ordered)
    const renderOrder = useMemo(() => {
        const ret = [...visualOrder[0], ...unselectedOrdered];
        console.log('Updating memoed renderOrder from visualOrder',  ret, {visualOrder, unselectedOrdered});
        return ret;
    }, [visualOrder[0], unselectedOrdered]);


    const availableChildren: Record<string, ReactElement<TagButtonProps>> = useMemo(()=>Object.fromEntries(
        availableTags.map(
            tagText => {
                const isPressed = props.selectedTags ? props.selectedTags.has(tagText) : false;
                // const matchCount = visibleProjects.filter(p=>p.tags[tagKey].has(tagText)).length;
                const matchCount = counts[tagText] ?? 0;
                return [tagText,
                    <TagButton id={CSS.escape(`tag-${tagKey}-${tagText}`)} matchCount={matchCount} disabled={!canToggleTag(tagText, isPressed)} key={tagText} colorClassName={props.colorClassName} isPressed={isPressed} tagText={tagText} toggleTag={toggleTag}></TagButton>
                ];
            }
        )
    ), [availableTags, toggleTag, props.selectedTags, counts, tagKey]);

    const renderedChildren = useMemo(() => renderOrder.map(tagText => availableChildren[tagText]), [renderOrder, availableChildren]);
    
    const prevRenderedChildren = useRef<null | typeof renderedChildren>(null);
    const prevState = useRef<ReturnType<typeof Flip['getState']> | null>(null);
    const flipTargetIDs = useMemo(()=>{
        return Object.values(availableChildren).map(
            x=>{
                // return x.props.id;
                return CSS.escape(`tag-${tagKey}-${x.key}`)
                // const elem = document.getElementById(x.props.id!);
                // // console.log(x.key, x.props.id, elem ?? x);
                // return elem;
            }
        )// .filter(x=>x !== undefined);
    }, [availableChildren]);


    // console.log('TARGETS:', flipTargets);
    const timeoutHandle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(()=>{
        const root = document.getElementById('project-browser-wrapper')!;
        function callback() {
            // console.log('callback');
            clearTimeout(timeoutHandle.current);
            timeoutHandle.current = setTimeout(()=>{
                const flipTargets = flipTargetIDs.map((id) => document.getElementById(id));
                prevState.current = Flip.getState(flipTargets, {simple: true, props: 'x,scaleX,width,background-color,background,opacity'}); //, props: 'scaleX,left,x,background-color,background,width,opacity'});
            }, 500);
        }
        root.addEventListener('scroll', callback, {passive: true, capture: false});
        return () => {
            root.removeEventListener('scroll', callback, {capture: false});
            clearTimeout(timeoutHandle.current);
        };
    }, []);

    useEffect(()=>{
        const prev = prevRenderedChildren.current;
        const flipTargets = flipTargetIDs.map((id) => document.getElementById(id));
        if(prev) {
            // console.log('TARGETS:', flipTargets);
            if(!prevState.current) {
                prevState.current = Flip.getState(flipTargets, {simple: true, props: 'x,scaleX,width,background-color,background,opacity'}); //, props: 'scaleX,left,x,background-color,background,width,opacity'});
            } else if(
                (prev.length !== renderedChildren.length)
                ||
                (prev.length && prev.some((x,i)=>renderedChildren[i].key !== x.key))
            ) {
                // Transition with GSAP Flip
                console.log('Rendered children changed order:', renderedChildren, prev);

                // const newState = Flip.getState(renderedChildren.map(x=>x.props.id!), {simple: false});
                // const newState = Flip.getState(renderedChildren.map(x=>CSS.escape(`tag-${tagKey}-${x.key}`)));
                const newState = Flip.getState(flipTargets, {simple: true, props: 'x,scaleX,width,background-color,background,opacity'}); // , props: 'scaleX,left,x,background-color,background,width,opacity'});
                const prevState_ = prevState.current;
                // requestAnimationFrame(()=>Flip.from(prevState_, {duration: 0.5}));

                // gsap.killTweensOf(flipTargets);
                Flip.from(prevState_, {duration: 0.2, ease: 'power2.inOut', simple: true,
                    nested: true,
                    // props: 'x,width,scaleX,opacity,background-color,background', 
                    props: 'x,scaleX,width,background-color,background,opacity',
                    absolute: false});
                // Flip.to(newState, {
                //     duration: 0.5,
                // });
                console.log('FLIP:', prevState.current, newState);
                prevState.current = newState; // Flip.getState(renderedChildren.map(x=>x.props.id!));
            }
        }
        prevRenderedChildren.current = renderedChildren;
        return ()=>{
            gsap.killTweensOf(flipTargets);
        }
    }, [renderedChildren, renderOrder]);


    useEffect(() => {
        const unregister = props.registerReset(()=>{
            setVisualOrder(vOrder => {
                const [selected, unselected] = vOrder;
                if(!selected.length) {
                    console.log('(in registered reset) No change to visual order:', vOrder);
                    return vOrder;
                }
                if(!unselected.length) {
                    const ret: [string[], string[]] = [computeTagOrdersSafe(selected)[1], unselected];
                    console.log('(in registered reset) Setting visual order:', ret);
                    return ret;
                }

                const newUnselected = [...unselected.filter(x=>!props.selectedTags?.has(x))];
                const newSelected = selected.filter(tag=>{
                    if(props.selectedTags?.has(tag))
                        return true;
                    if(!newUnselected.includes(tag)) newUnselected.push(tag);
                    return false;
                });
                const ret: [string[], string[]] = [computeTagOrdersSafe(newSelected, true)[1], computeTagOrdersSafe(newUnselected, true)[1]];
                console.log('(in registered reset) Setting visual order:', ret);
                return ret;
            });
        });
        return unregister;
    }, [props.selectedTags, props.availableTags, setVisualOrder]);

    return <div data-role='tag-buttons'>
        {renderedChildren}
    </div>
}