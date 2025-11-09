import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactElement, type ReactNode, type Ref, type RefObject, type SetStateAction } from "react";
import TagButton, { type TagButtonProps } from "./TagButton";
import type { TagType } from "../FilterForm";

type TagButtonsProps = {
    colorClassName?: string,
    // selectedTags: string[] | undefined,
    availableTags: Set<string>,
    tagType: TagType,
    setSelectedTags: (tags: string[] | undefined) => void,
    // setFilterStatus: (includeInFilter: boolean) => void,
    // toggleFilterStatus: (tagText: string, pressed?: boolean) => void,
};


export default function TagButtons(props: TagButtonsProps) {    
        const availableTags = Array.from(props.availableTags.values());
        const availableToggleStates = Object.fromEntries(availableTags.map(tagText=>[tagText, useState<boolean>(false)]));

        const availableChildren: Record<string, ReactElement<TagButtonProps>> = Object.fromEntries(
            Object.entries(availableToggleStates).map(
                ([tagText, [isPressed, setIsPressed]]) => [tagText, 
                    <TagButton key={tagText} colorClassName={props.colorClassName} tagText={tagText} isPressed={isPressed} setIsPressed={setIsPressed}></TagButton>
                ]
            )
        )

        // const availableHandles = useMemo(()=>availableTags.map(()=>useRef<TagButtonHandle>(null)), [availableTags]);
    
        // const availableChildren: Record<string, [RefObject<TagButtonHandle | null>, ReactElement<TagButtonProps>]> = useMemo(()=>{
        //     return Object.fromEntries(
        //     availableTags.map((tagText, i) => [tagText, [
        //         availableHandles[i], <TagButton ref={availableHandles[i]} key={tagText} colorClassName={props.colorClassName} tagText={tagText}></TagButton>
        //     ]])
        // )}, [props.colorClassName, availableTags, availableHandles]);

        // const [orderedTags, setOrderedTags] = useState<string[]>(availableTags);
        // const orderedChildren: (Element | ReactNode)[] = useMemo(
        //     ()=>{
                
        //     }, [availableChildren, props.availableTags, props.selectedTags]
        // )


        const selectedTags = useMemo(() => Object.entries(availableChildren).filter(
            ([tagText, tagButton]) => {
                return tagButton.props.isPressed
                // const [isPressed, _] = availableToggleStates[tagText];
                // console.log(`${tagText}: ${isPressed}/${tagButton.props.value}`, tagButton);
                // return isPressed;
                // const handle = buttonRef?.current;
                // console.log('buttonRef/tagButton/handle:', buttonRef, tagButton, handle);
                // if(handle) {
                //     const toggle: HTMLButtonElement | null = handle.getToggle();
                //     console.log('isPressed / getToggle()?.value:',
                //         handle.isPressed(), toggle?.value
                //     )
                // }
                // return (handle && handle.isPressed()) || tagButton.props.value;
            }
        ).map(([a,_])=>a), [availableChildren, availableToggleStates]);

        const orderedTags = useMemo(()=>{
            const _selectedTags: string[] = [];
            const _unselectedTags: string[] = [];

            
            availableTags.forEach((tagText) => {
                if(selectedTags?.includes(tagText))
                    _selectedTags.push(tagText);
                else
                    _unselectedTags.push(tagText);
            });
            // console.log(`Selected ${props.tagType} tags:`, selectedTags, _selectedTags);
            _selectedTags.push(..._unselectedTags);
            return _selectedTags;
        }, [availableTags, selectedTags]);

        const orderedChildren = useMemo(() => orderedTags.map((tagText)=>availableChildren[tagText]), [orderedTags, availableChildren])


        // useEffect(()=>{



        // });
        return <div data-role='tag-buttons'>
            {orderedChildren}
        </div>

}