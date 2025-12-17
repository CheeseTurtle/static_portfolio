import * as AccordionPrimitive from "@radix-ui/react-accordion";
import React from "react";



type MultiAccordionContextValue = {
    level: 1 | 2 | 3 | 4 | 5 | 6,
    root: React.RefObject<MultiAccordionHandle | null>,
    rootElem: React.RefObject<HTMLDivElement | null>,
    items: React.RefObject<Record<string, React.RefObject<MultiAccordionHandle | null>>>,
    itemElems: React.RefObject<Record<string, React.RefObject<HTMLDivElement | null>>>,
    readonly parentContext: React.RefObject<MultiAccordionContextValue | null>,
    readonly rootContext: React.RefObject<MultiAccordionContextValue | null>,
}

const MultiAccordionContext = React.createContext<MultiAccordionContextValue | null>(null);

function useNewMultiAccordionContext(level?: number) {
    const rootElem: MultiAccordionContextValue['rootElem'] = React.useRef(null);
    const itemElems: MultiAccordionContextValue['itemElems'] = React.useRef({});
    const items: MultiAccordionContextValue['items'] = React.useRef({});

    const root: MultiAccordionContextValue['root'] = React.useRef(null);

    const parent = React.useContext(MultiAccordionContext);
    const parentContext = React.useRef(parent ?? null);
    const rootContext = React.useRef(parent?.rootContext?.current ?? parent ?? null);

    const myLevel = React.useMemo(()=>(level ?? ((parent?.level ?? 0) + 1)), [parent, level])

    React.useEffect(()=>{
        parentContext.current = parent ?? null;
        rootContext.current = parent?.rootContext.current ?? parentContext.current
    }, [parent]);


    const myValue = React.useMemo(()=>({
        root, items, rootElem, itemElems, parentContext, rootContext, level: myLevel,
    }), [rootElem, itemElems, parentContext, root, items, rootContext, myLevel]);
    return [myValue, root, rootElem, items] as [MultiAccordionContextValue, MultiAccordionContextValue['root'], MultiAccordionContextValue['rootElem'], MultiAccordionContextValue['itemElems']]
}


function useMultiAccordionContext() {
    const value = React.useContext(MultiAccordionContext);
    if(!value)
        throw new Error('Not in MultiAccordionContext Provider')

    return value;
}


type MultiAccordionProps = Omit<AccordionPrimitive.AccordionMultipleProps, 'type'> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6,
};


const H1Elem = (props: React.ComponentProps<'h1'>) => <h1 {...props} />
const H2Elem = (props: React.ComponentProps<'h2'>) => <h2 {...props} />
const H3Elem = (props: React.ComponentProps<'h3'>) => <h3 {...props} />
const H4Elem = (props: React.ComponentProps<'h4'>) => <h4 {...props} />
const H5Elem = (props: React.ComponentProps<'h5'>) => <h5 {...props} />
const H6Elem = (props: React.ComponentProps<'h6'>) => <h6 {...props} />


function useHeadingElementConstructor(level: 1 | 2 | 3 | 4 | 5 | 6, useHeadingElem?: boolean) {
    const Constructor = React.useMemo(()=>{
        // return `h${level}`
        if(useHeadingElem) return [H1Elem, H2Elem, H3Elem, H4Elem, H5Elem, H6Elem][level - 1];
        return React.Fragment;
    }, [level, useHeadingElem]);
    return Constructor;
}



type MultiAccordionHandle = {
    setMaxShownLevel: (level: 1 | 2 | 3 | 4 | 5 | 6) => void,
    collapseLevels: (from: 1 | 2 | 3 | 4 | 5 | 6, to?: 1 | 2 | 3 | 4 | 5 | 6, withinCollapsed?: boolean) => void,
    expandLevels: (from: 1 | 2 | 3 | 4 | 5 | 6, to?: 1 | 2 | 3 | 4 | 5 | 6, withinCollapsed?: boolean) => void,
}


// type MultiAccordionItemHandle = {
//     collapse: ()
// }


export function MultiAccordion({children, level, ...props}: MultiAccordionProps) {

    const [contextValue, root, rootElem, items] = useNewMultiAccordionContext(level);


    const setMaxShownLevel = React.useCallback(()=>{



    }, [])

    const collapseLevels: MultiAccordionHandle['collapseLevels'] = React.useCallback(()=>{


    }, [])


    const expandLevels: MultiAccordionHandle['expandLevels'] = React.useCallback(()=>{


    }, [])
    

    React.useImperativeHandle(root, ()=>({
        setMaxShownLevel, collapseLevels, expandLevels
    }), [setMaxShownLevel, collapseLevels, expandLevels]);

    return <MultiAccordionContext.Provider value={contextValue}>
        <AccordionPrimitive.Root type="multiple" ref={rootElem} {...props}>
            {children}
        </AccordionPrimitive.Root>
    </MultiAccordionContext.Provider>;
}


type MultiAccordionItemProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.AccordionItem> & {
    headerContent: React.ReactNode,
    useHeadingElem?: boolean
}

export function MultiAccordionItem({value, children, headerContent, useHeadingElem=true, ...props}: MultiAccordionItemProps) {
    const {itemElems: items, level} = useMultiAccordionContext();
    items.current[value] ??= React.createRef();

    const HElem = useHeadingElementConstructor(level, useHeadingElem);

    return <AccordionPrimitive.AccordionItem ref={items.current[value]} value={value} {...props}>
        <AccordionPrimitive.AccordionHeader>
            <AccordionPrimitive.AccordionTrigger asChild>
                <HElem>{headerContent}</HElem>
            </AccordionPrimitive.AccordionTrigger>
        </AccordionPrimitive.AccordionHeader>
        <AccordionPrimitive.AccordionContent>
            {children}
        </AccordionPrimitive.AccordionContent>
    </AccordionPrimitive.AccordionItem>
}