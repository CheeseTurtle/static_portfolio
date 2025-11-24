import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { ToggleProps } from "@radix-ui/react-toggle";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState, type Dispatch, type ReactElement, type SetStateAction } from "react";

export type TagButtonProps = {
    tagText: string,
    colorClassName?: string,
    isPressed: boolean,
    matchCount: number,
    toggleTag: (tagText: string, isPressed: boolean) => void,
} & ToggleProps;


const TagButton = ({isPressed, toggleTag, disabled, tagText, matchCount, colorClassName, ...props}: TagButtonProps) => {

    const onPressedChange = useCallback((pressed: boolean) => toggleTag(tagText, pressed), [tagText, toggleTag]);

    const variant = useMemo(()=>(disabled ? 'default' : 'outline'), [disabled]);

    const colorClassName_ = useMemo(()=>colorClassName ?? '', [colorClassName]);

    return <Toggle className={cn(colorClassName_)} disabled={disabled} aria-disabled={disabled} variant={variant} pressed={isPressed} onPressedChange={(pressed)=>{
        console.log('%cTag %s %s', 'color: black; background-color: yellow;', tagText, isPressed ? 'PRESSED' : 'UNPRESSED');
        onPressedChange(pressed);
    }} {...props}>{tagText}&nbsp;({matchCount})</Toggle>;
};

export default TagButton;