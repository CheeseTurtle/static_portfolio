import React from "react";
import { checkSelection, clearSelection, selectElementsText } from "./selection";





export default function useSelection() {
    const targetElements = React.useRef<React.RefObject<HTMLElement|null>[]>([]);

    const [anySelection, setAnySelection] = React.useState<boolean>(false);
    const [fullSelection, setFullSelection] = React.useState<boolean>(false);

    const setSelection = React.useCallback((select: boolean)=>{
        const elements = targetElements.current.map(x=>x.current).filter(x=>!!x);
        console.log((select ? 'Selecting':'Deselecting') + 'text in elements:', elements);
        if(select) 
            void Promise.resolve().then(()=>{
                selectElementsText(elements);
                setAnySelection(true);
                setFullSelection(true);
            });
        else 
            void Promise.resolve().then(()=>{
                clearSelection();
                setAnySelection(false);
                setFullSelection(false);
            });
    }, [])

    React.useEffect(()=>{
        const listener = (_evt: Event) => {
            const elements = targetElements.current.map(x=>x.current).filter(x=>!!x);
            const [anySelection, fullSelection] = checkSelection(elements, false);
            console.log('Selection changed:', anySelection, fullSelection);
            setAnySelection(anySelection ?? false);
            setFullSelection(fullSelection ?? false);
        }
        document.addEventListener('selectionchange', listener, {passive: true});
        return ()=>{
            document.removeEventListener('selectionchange', listener);
        }
    }, []);
    
    return {targetElements, setSelection, anySelection, fullSelection};
}