import React, { useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState, type ReactElement } from "react";
import TagButton, { type TagButtonProps } from "./TagButton";
import type { TagType } from "../FilterForm";
import type { ProjectInfo } from "../../types";
import { getProjectKeyFromTagType } from "./filterTypes";
import { useCountContext } from "./stores/countStore";

import Flip from "gsap/dist/Flip";
import { useFlipAnimation } from "@/hooks/useFlip";
import { useMounted } from "@/hooks/use-mounted";

type TagButtonsProps = {
    colorClassName?: string,
    selectedTags: Set<string> | undefined,
    availableTags: Set<string>,
    projects: ProjectInfo[],
    tagType: TagType,
    toggleTag: (tagText: string) => void,
    registerReset: (resetFn: () => void) => () => void
};

export default function TagButtons({toggleTag: propsToggleTag, availableTags: availableTagsSet, selectedTags, tagType, registerReset, colorClassName}: TagButtonsProps) {    
    const tagKey = useMemo(()=>getProjectKeyFromTagType(tagType), [tagType]);
    const availableTags = useMemo(() => Array.from(availableTagsSet.values()), [availableTagsSet]);

    // [selected tags, unselected tags]
    const [visualOrder, setVisualOrder] = useState<[string[],string[]]>([[],availableTags]);

    const counts = useCountContext(s=>s.current.tagCounts[tagKey], (a,b)=>{
        const bKeys = new Set<string>(Object.keys(b));
        if(Object.entries(a).some(([k,v])=>(bKeys.delete(k) ? b[k] : 0) !== v))
            return false;
        if(bKeys.size && [...bKeys].some(k=>b[k]))
            return false;
        return true;
    });
    const computeTagOrders_ = useCountContext(s=>s.computeTagOrders);
    const computeTagOrders = useCallback((tags: string[], inPlace?: boolean) => {
        // console.log('Using counts to compute new tag orders:', counts);
        return computeTagOrders_(tags, counts, inPlace);
    }, [counts, computeTagOrders_]);
    
    // const computeTagOrdersSafe = useEffectEvent(computeTagOrders);


    // update visualOrder on mount or when availableTags changes
    useEffect(() =>
        setVisualOrder(([selected, _unselected]) => {
            const newUnselected = computeTagOrders(availableTags.filter(x=>!selected.includes(x)), true)[1];
            // console.log('(On mount / availableTags changed) Setting visual order (updating newUnselected):', [selected, newUnselected]);
            return [selected.filter(x=>availableTags.includes(x)), newUnselected] as [string[], string[]];
    }), [availableTags, computeTagOrders]);

    const toggleTag = useCallback((tagText: string, isPressed: boolean) => {
        if (isPressed) {
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
    }, [propsToggleTag, selectedTags, computeTagOrders]);

    const canToggleTag = useCallback((tagText: string, currentlyActive: boolean) => currentlyActive || counts[tagText], [counts]);

    const unselectedOrdered = useMemo(() => {
        const [, unselected] = visualOrder;
        // if (!props.projects) return unselected;

        const ret = computeTagOrders(unselected, false)[1];
        // console.log('Updating memoed unselectedOrdered', unselected, ret);
        return ret;
    }, [visualOrder, computeTagOrders]);

    // final render order = selected first, then unselected (dynamically ordered)
    const renderOrder = useMemo(() => {
        const ret = [...visualOrder[0], ...unselectedOrdered];
        // console.log('Updating memoed renderOrder from visualOrder',  ret, {visualOrder, unselectedOrdered});
        return ret;
    }, [visualOrder, unselectedOrdered]);


    const availableChildren: Record<string, ReactElement<TagButtonProps>> = useMemo(()=>Object.fromEntries(
        availableTags.map(
            tagText => {
                const isPressed = selectedTags?.size ? selectedTags.has(tagText) : false;
                const matchCount = counts[tagText] ?? 0;
                return [tagText,
                    <TagButton id={CSS.escape(`tag-${tagKey}-${tagText}`)} matchCount={matchCount} disabled={!canToggleTag(tagText, isPressed)} key={tagText} colorClassName={colorClassName} isPressed={isPressed} tagText={tagText} toggleTag={toggleTag}></TagButton>
                ];
            }
        )
    ), [availableTags, selectedTags, colorClassName, counts, tagKey, canToggleTag, toggleTag]);

    const renderedChildren = useMemo(() => renderOrder.map(tagText => availableChildren[tagText]), [renderOrder, availableChildren]);
    
    const prevRenderedChildren = useRef<null | typeof renderedChildren>(null);
    const prevState = useRef<ReturnType<typeof Flip['getState']> | null>(null);
    const flipTargetIDs = useMemo(()=>{
        return Object.values(availableChildren).map(
            x=>{
                return CSS.escape(`tag-${tagKey}-${x.key}`)
            }
        );
    }, [availableChildren, tagKey]);

    const flipCleanupPending = useRef<boolean>(false);

    const [flipProps, _setFlipProps] = useState<string|undefined>('x,scaleX,opacity' + 'width,background-color,background');

    const updatePrevState = useCallback(()=>{
        const flipTargets = flipTargetIDs.map((id) => document.getElementById(id));
        prevState.current = Flip.getState(flipTargets, {simple: true, props: flipProps}); //, props: 'scaleX,left,x,background-color,background,width,opacity'});
    }, [flipTargetIDs, flipProps]);
    
    const onEndFlip = useCallback(()=>{
        if(!flipCleanupPending.current) return;
        updatePrevState();
    }, [updatePrevState]);

    const { isFlipping, isFlippingRef, startFlip, endFlip } = useFlipAnimation({onFlipEnd: onEndFlip});

    // const [_isPending, startTransition] = React.useTransition();

    const timeoutHandle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(()=>{
        if(isFlippingRef.current) return;
        function callback() {

            // startTransition(()=>{
                if(isFlippingRef.current) {
                    console.log('Flipping')
                    flipCleanupPending.current = true;
                    return;
                }

                clearTimeout(timeoutHandle.current);
                timeoutHandle.current = setTimeout(()=>{
                    // React.startTransition(()=>{
                        const flipTargets = flipTargetIDs.map((id) => document.getElementById(id));
                        prevState.current = Flip.getState(flipTargets, {simple: true, props: flipProps}); //, props: 'scaleX,left,x,background-color,background,width,opacity'});
                        flipCleanupPending.current = false;
                    // })
                }, 500);
            // });
        }

        const root = document.getElementById('project-browser-wrapper');
        if(!root) return;
        root.addEventListener('scroll', callback, {passive: true, capture: false});
        return () => {
            root.removeEventListener('scroll', callback, {capture: false});
            clearTimeout(timeoutHandle.current);
        };
    }, [flipTargetIDs, isFlippingRef, flipProps]);

    const updatePrevState_ = useEffectEvent(updatePrevState);
    useEffect(()=>{
        if(isFlipping) return;
        if(flipCleanupPending.current) {
            updatePrevState_();
            flipCleanupPending.current = false;
        }
    }, [isFlipping]);


    useEffect(()=>{
        const prev = prevRenderedChildren.current;
        const flipTargets = flipTargetIDs.map((id) => document.getElementById(id));
        // startTransition(()=>{
            if(prev) {
                // console.log('TARGETS:', flipTargets);
                if(!prevState.current) {
                    prevState.current = Flip.getState(flipTargets, {simple: true, props: flipProps}); //, props: 'scaleX,left,x,background-color,background,width,opacity'});
                } else if(
                    (prev.length !== renderedChildren.length)
                    ||
                    (prev.length && prev.some((x,i)=>renderedChildren[i].key !== x.key))
                ) {
                    // Transition with GSAP Flip
                    // console.log('Rendered children changed order:', renderedChildren, prev);

                    startFlip();

                    const newState = Flip.getState(flipTargets, {simple: true, props: flipProps}); // , props: 'scaleX,left,x,background-color,background,width,opacity'});
                    const prevState_ = prevState.current;

                    // gsap.killTweensOf(flipTargets);
                    Flip.from(prevState_, {duration: 0.2, ease: 'power2.inOut', 
                        simple: true,
                        nested: true,
                        props: flipProps,
                        absolute: false,
                        onComplete: () => endFlip(),
                        onInterrupt: () => endFlip()
                    });
                    // console.log('FLIP:', prevState.current, newState);
                    prevState.current = newState;
                }
            }
            prevRenderedChildren.current = renderedChildren;
        // });
        // return ()=>{
        //     // Flip.killFlipsOf(flipTargets, true);
        //     // gsap.killTweensOf(flipTargets);
        //     endFlip();
        // }
    }, [renderedChildren, renderOrder, flipTargetIDs, startFlip, endFlip, flipProps]);

    const mounted = useMounted();
    const initOrderChecked = useRef<boolean>(false);


    const checkLayout = useEffectEvent(()=>{
        if(selectedTags?.size) {
            // console.log(selectedTags);
            setVisualOrder(([_selected, unselected]) => [computeTagOrders([...selectedTags])[1],unselected.filter(x=>selectedTags.has(x))] as [string[], string[]]);
        }
    });
    useLayoutEffect(()=>{
        console.log('TagButtons layout effect begin')
        // console.log(mounted, initOrderChecked.current);
        if(!mounted || initOrderChecked.current) return;
        checkLayout();
        // if(selectedTags?.size)
        //     setVisualOrder(([selected, unselected]) => [computeTagOrders([...selectedTags])[1],unselected.filter(x=>!selectedTags.has(x))] as [string[], string[]]);
        initOrderChecked.current = true;
        console.log('TagButtons layout effect end')
    }, [mounted, setVisualOrder, computeTagOrders]);

    useEffect(() => {
        const unregister = registerReset(()=>{
            setVisualOrder(vOrder => {
                const [selected, unselected] = vOrder;
                if(!selected.length) {
                    // console.log('(in registered reset) No change to visual order:', vOrder);
                    return vOrder;
                }
                if(!unselected.length) {
                    const ret: [string[], string[]] = [computeTagOrders(selected)[1], unselected];
                    // console.log('(in registered reset) Setting visual order:', ret);
                    return ret;
                }

                const newUnselected = [...unselected.filter(x=>!selectedTags?.has(x))];
                const newSelected = selected.filter(tag=>{
                    if(selectedTags?.has(tag))
                        return true;
                    if(!newUnselected.includes(tag)) newUnselected.push(tag);
                    return false;
                });
                const ret: [string[], string[]] = [computeTagOrders(newSelected, true)[1], computeTagOrders(newUnselected, true)[1]];
                // console.log('(in registered reset) Setting visual order:', ret);
                return ret;
            });
        });
        return unregister;
    }, [selectedTags, setVisualOrder, registerReset, computeTagOrders]);

    return <div data-role='tag-buttons'>
        {renderedChildren}
    </div>
}