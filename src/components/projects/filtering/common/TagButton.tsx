import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { ToggleProps } from "@radix-ui/react-toggle";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState, type Dispatch, type ReactElement, type SetStateAction } from "react";

export type TagButtonProps = {
    tagText: string,
    colorClassName?: string,
    isPressed: boolean,
    toggleTag: (tagText: string, isPressed: boolean) => void,
} & ToggleProps;


const TagButton = ({isPressed, toggleTag, ...props}: TagButtonProps) => {

    const onPressedChange = useCallback((pressed: boolean) => toggleTag(props.tagText, pressed), [props.tagText, toggleTag]);

    const variant = useMemo(()=>(isPressed ? 'default' : 'outline'), [isPressed]);

    const colorClassName = useMemo(()=>props.colorClassName ?? '', [props.colorClassName]);

    return <Toggle className={cn(colorClassName)} variant={variant} pressed={isPressed} onPressedChange={onPressedChange}>{props.tagText}</Toggle>;
};

export default TagButton;