import React from "react";
import { checkSelection, clearSelection, selectElementsText } from "./selection";





export default function useSelection(initiallyEnabled?: boolean) {
    const targetElements = React.useRef<React.RefObject<HTMLElement|null>[]>([]);

    const [anySelection, setAnySelection] = React.useState<boolean>(false);
    const [fullSelection, setFullSelection] = React.useState<boolean>(false);
    const [enabled, setEnabled] = React.useState<boolean>(initiallyEnabled ?? false);

    const setSelection = React.useCallback((select: boolean)=>{
        const elements = targetElements.current.map(x=>x.current).filter(x=>!!x);
        // console.log((select ? 'Selecting':'Deselecting') + 'text in elements:', elements);
        if(select) 
            void Promise.resolve().then(()=>{
                selectElementsText(elements);
                const [anySelection, fullSelection] = checkSelection(elements, true);
                setAnySelection(anySelection ?? false);
                setFullSelection(fullSelection ?? false);
            });
        else 
            void Promise.resolve().then(()=>{
                clearSelection();
                setAnySelection(false);
                setFullSelection(false);
            });
    }, [])

    const enabledRef = React.useRef<boolean>(enabled);
    React.useEffect(()=>{
        // console.log('SELECTION MONITORING ENABLED:', enabled);
        enabledRef.current = enabled;
    }, [enabled]);

    React.useEffect(()=>{
        const listener = (_evt: Event) => {
            // console.log('SELECTION CHANGED:', enabledRef.current)
            if(!enabledRef.current) return;
            const elements = targetElements.current.map(x=>x.current).filter(x=>!!x);
            const [anySelection, fullSelection] = checkSelection(elements, true);
            // console.log('Selection changed:', anySelection, fullSelection);
            setAnySelection(anySelection ?? false);
            setFullSelection(fullSelection ?? false);
        }
        document.addEventListener('selectionchange', listener, {passive: true});
        return ()=>{
            document.removeEventListener('selectionchange', listener);
        }
    }, []);
    
    return {targetElements, setSelection, anySelection, fullSelection, enabled, setEnabled};
}