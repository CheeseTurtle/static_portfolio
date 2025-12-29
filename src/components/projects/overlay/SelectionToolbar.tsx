import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { LucideDoorOpen, LucideSquareDashedMousePointer, LucideSquareMousePointer } from "lucide-react";
import React from "react";
import { clearSelection } from "./selection";


export type SelectionToolbarProps = React.ComponentProps<'div'> & {
    buttonGroupProps?: Omit<React.ComponentProps<typeof ButtonGroup>, 'className' | 'children'>,
    open?: boolean,
    onOpenChange?: React.Dispatch<React.SetStateAction<boolean>> | ((open: boolean) => void),
    side?: 'bottom' | 'top',
    selectAll: () => void,
    selectNone: () => void,
    setTextSelectionMode: (mode: number) => void,
    anySelection: boolean,
    fullSelection: boolean,
    targetElements?: React.ReactNode,
};

export const SelectionToolbar = (({buttonGroupProps, anySelection, fullSelection, setTextSelectionMode, selectAll, selectNone, open, onOpenChange, className, side='bottom', targetElements, ...props}: SelectionToolbarProps) => {

    const targetElementsRef = React.useRef<typeof targetElements>(null);

    React.useEffect(()=>{
        if(targetElementsRef.current) {
            // console.log('Clearing selection')
            clearSelection();
        }
        targetElementsRef.current = targetElements;
    }, [targetElements]);

    const selectAll_ = React.useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
        // evt.preventDefault();
        evt.stopPropagation();
        selectAll();
    }, [selectAll]);

    const selectNone_ = React.useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
        // evt.preventDefault();
        evt.stopPropagation();
        selectNone();
    }, [selectNone]);

    const exit = React.useCallback((evt: React.MouseEvent<HTMLButtonElement>)=>{
        // evt.preventDefault();
        evt.stopPropagation();
        setTextSelectionMode(0);
        onOpenChange?.(false);
    }, [setTextSelectionMode, onOpenChange]);

    const openedRef = React.useRef<boolean>(open);
    React.useEffect(()=>{
        if(open === openedRef.current) return;
        openedRef.current = open;
        if(open) onOpenChange?.(true);
    }, [open, onOpenChange]);
    if(!open) return null;

    return <div className={
        cn("z-75 drop-shadow-card-foreground drop-shadow-md fixed align-middle self-center justify-self-center pointer-events-auto", 
            side === 'bottom' ? 'bottom-[calc(min(15%,50*var(--spacing)))]' : 'top-0',
            className)
    } {...props}>
        <ButtonGroup className="" orientation='horizontal' aria-orientation="horizontal" {...buttonGroupProps}>
            <Button className="not-disabled:cursor-pointer" onClick={selectAll_} disabled={fullSelection}>
                <LucideSquareMousePointer/>
                Select all
            </Button>
            <Button className="not-disabled:cursor-pointer" onClick={selectNone_} disabled={!anySelection}>
                <LucideSquareDashedMousePointer/>
                Clear selection
            </Button>
            <ButtonGroupSeparator/>
            <Button className="not-disabled:cursor-pointer" onClick={exit} variant="secondary">
                {/* <LucideCircleCheck/>
                Finish text selection */}
                <LucideDoorOpen />
                Exit text selection mode
            </Button>
        </ButtonGroup>
    </div>
});

export default SelectionToolbar;