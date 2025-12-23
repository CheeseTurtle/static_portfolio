import { ContextMenuSeparator, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from "@/components/ui/context-menu";
// import { useMergeRefs } from "@/hooks/use-merge-refs";
// import useEnsureRef from "@/hooks/useEnsureRef";
import { cn } from "@/lib/utils";
import React from "react";


export type ProjectCarouselContextMenuContentProps = {
    isProjectActive: boolean,
    selectableText: number,
    setSelectableText: React.Dispatch<React.SetStateAction<number>>,
    handleRef?: React.RefObject<ProjectCarouselContextMenuContentHandle | null>,
} & React.ComponentProps<typeof ContextMenuContent>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ProjectCarouselContextMenuContentHandle = {
    // close: () => void,
}

export const ProjectCarouselContextMenuContent = React.memo(({isProjectActive, selectableText, setSelectableText, className, handleRef, ref, ...props}: ProjectCarouselContextMenuContentProps)=>{

    // const localContentRef = React.useRef<HTMLDivElement>(null);
    // const contentRef = React.useMemo(()=>ref ?? localContentRef, [ref]);
    // const contentRef = useEnsureRef<HTMLDivElement>(ref, null);
    // const contentRef = React.useRef<HTMLDivElement>(null);

    // // useMergeRefs(ref, contentRef);

    // const close = React.useCallback(()=>{
    //     const div = contentRef.current;
    //     if(!div) return;
    //     // const attr = div.attributes.getNamedItem('data-state');
    //     const state = div.getAttribute('data-state')
    //     console.log(`Closing context menu (previous state: ${state}`);
    //     div.setAttribute('data-state', 'closed');
    // }, [contentRef]);

    // const [state, setState] = React.useState<'open' | 'closed' | undefined>(undefined);

    // const close = React.useCallback(()=>{
    //     setState('closed');
    // }, []);

    // React.useImperativeHandle(handleRef, ()=>({
    //     close
    // }), [close]);


    const onCheckedChange = React.useCallback((checked: boolean)=>setSelectableText(checked ? 2 : 0), [setSelectableText]);
    const onClick = React.useCallback((evt: React.MouseEvent<HTMLDivElement>)=>{
        // evt.preventDefault();
        // evt.stopPropagation();
        setSelectableText(1);
    }, [setSelectableText]);

    return <ContextMenuContent className={cn("select-none", className)} {...props}>
        <ContextMenuLabel>Context menu</ContextMenuLabel>
        
        <ContextMenuSub>
            <ContextMenuSubTrigger disabled={!isProjectActive} className="data-disabled:opacity-50">
                Copy project link...
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
                <ContextMenuItem disabled={!isProjectActive}>Copy link without filters</ContextMenuItem>
                <ContextMenuItem disabled={!isProjectActive}>Copy link with filters</ContextMenuItem>
            </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator></ContextMenuSeparator>
        
        <ContextMenuCheckboxItem defaultChecked={false} checked={selectableText === 2} onCheckedChange={onCheckedChange} disabled={!isProjectActive}>
            Selectable text
        </ContextMenuCheckboxItem>
        <ContextMenuItem inset disabled={!!selectableText || !isProjectActive} onClick={onClick}>
            Select text...
            {/* <ContextMenuShortcut></ContextMenuShortcut> */}
        </ContextMenuItem>
    </ContextMenuContent>
});


export default ProjectCarouselContextMenuContent;