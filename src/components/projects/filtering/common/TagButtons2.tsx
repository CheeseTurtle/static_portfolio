import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState, type ReactElement } from "react";
import TagButton, { type TagButtonProps } from "./TagButton";

import { Flip } from "gsap/Flip";
import {gsap} from "gsap";
import { useFlipAnimation } from "@/hooks/useFlip";
import { useMounted } from "@/hooks/use-mounted";
import { useTagSectionStore } from "./stores/filterFormStoreContext";
import { shallow } from "zustand/shallow";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type TagButtonsProps = {
    // store: TagSectionStore,
};

// eslint-disable-next-line no-empty-pattern
export default function TagButtons({}: TagButtonsProps) {
    // TODO: Move elsewhere
    useEffect(()=>{
        gsap.registerPlugin(Flip);
    }, []);

    // {toggleTag: propsToggleTag, availableTags: availableTagsSet, selectedTags, tagType, registerReset, colorClassName}

    const {tagKey, availableTags, registerReset, computeTagOrders, setVisualOrder, toggleTag, canToggleTag, colorClassName, } = useTagSectionStore(s=>({
        tagKey: s.tagKey, availableTags: s.availableTags, computeTagOrders: s.computeTagOrders,
        registerReset: s.registerReset,
        setVisualOrder: s.setVisualOrder, toggleTag: s.toggleTag, canToggleTag: s.canToggleTag, colorClassName: s.colorClassName,
    }), shallow)

    // [selected tags, unselected tags]
    // const visualOrder = useStore(store, s=>s.visualOrder);
    const renderOrder = useTagSectionStore(s=>s.renderOrder);

    const selectedTags = useTagSectionStore(s=>s.selectedTags);
    const counts = useTagSectionStore(s=>s.counts);

    const availableChildren: Record<string, ReactElement<TagButtonProps>> = useMemo(()=>Object.fromEntries(
        Array.from(availableTags).map(
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
        prevState.current = Flip.getState(flipTargets, {simple: true, props: flipProps});
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
                        nested: false,
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