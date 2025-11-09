import { Toggle } from "@/components/ui/toggle";
import type { ToggleProps } from "@radix-ui/react-toggle";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState, type Dispatch, type ReactElement, type SetStateAction } from "react";

export type TagButtonProps = {
    tagText: string,
    // includedItems: string[] | undefined,
    // setFilterStatus: (includeInFilter: boolean) => void,
    // toggleFilterStatus: (tagText: string, pressed?: boolean) => void,
    colorClassName?: string,
    isPressed: boolean,
    setIsPressed: Dispatch<SetStateAction<boolean>>,
} & ToggleProps;

// export interface TagButtonHandle {
//     isPressed: () => boolean;
//     getToggle: () => HTMLButtonElement | null,
// };


const TagButton = forwardRef(({isPressed, setIsPressed, ...props}: TagButtonProps, ref) => {
    // const [isPressed, setIsPressed] = useState<boolean>(false);
    // const isIncluded = useMemo(() => {
    //     const ret = ((props.includedItems && props.includedItems.length > 0 && props.includedItems.includes(props.tagText)) || false);
    //     console.log(`Is ${props.tagText} included in ${props.includedItems}? ${ret}`);
    //     return ret;
    // }, [props.includedItems, props.tagText]);

    // const toggleRef = useRef<HTMLButtonElement>(null);

    // const handleRef = useRef<TagButtonHandle>({
    //     isPressed: ()=>{
    //         console.log('isPressed:', isPressed);
    //         return isPressed;
    //     },
    //     getToggle: () => toggleRef.current
    // });
    // useImperativeHandle(ref, () => handleRef.current);

    return <Toggle className={`${props.colorClassName ?? ''}`} variant={isPressed ? 'default' : 'outline'} pressed={isPressed} onPressedChange={
        (pressed) => {
            // props.toggleFilterStatus(props.tagText, pressed);
            setIsPressed(pressed);
        }
    }>{props.tagText}</Toggle>;
});

export default TagButton;