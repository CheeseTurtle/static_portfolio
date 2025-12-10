import React from "react";
import type { ProjectInfo, ProjectMediaType } from "../types";
import {ProjectMedia, type ProjectMediaProps} from "./ProjectMedia";
// import { useDomReady } from "@/hooks/use-dom-ready";
import { transformTree } from "./transformTree";
import { useCaptionedLightbox } from "../lightbox";

type ContentKeys = 'contentMdx' | 'contentHtml' | 'contentElem' | 'images';
export type ProjectInfoForProvider = Omit<ProjectInfo, ContentKeys>;

export type ProjectProviderProps = {
    project: ProjectInfoForProvider,
}

export type ProjectContextState = {
    project: ProjectInfoForProvider,
    openLightbox: (key: string, source: React.JSX.Element | string, caption?: React.JSX.Element | null) => void,
}

export const ProjectContext = React.createContext<ProjectContextState | null>(null);


// function getReplacements(div: HTMLDivElement, refs: React.RefObject<React.RefObject<HTMLElement | null>[]>): [Element[], React.JSX.Element[]] {
//     const placeholders = div.querySelectorAll('.project-media-placeholder');
//     if(!placeholders.length) return [[], []];
//     const arr = [...placeholders];
//     return [arr, arr.map((p, i)=>{
//         // console.log(p.attributes);
//         const id = p.attributes.getNamedItem('data-media-id')!.value;
//         const useFallback = p.attributes.getNamedItem('data-media-use-fallback')?.value === 'true';
//         const kind = p.attributes.getNamedItem('data-media-kind')?.value || undefined;
//         const propsStr = p.attributes.getNamedItem('data-media-props')?.value;
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//         const props = propsStr && JSON.parse(propsStr);

//         const replacement = <ProjectMedia key={i} ref={refs.current[i]} id={id} kind={kind as ProjectMediaType | undefined} useFallback={useFallback} {...props}/>;
//         return replacement;
//         // div.replaceChild(replacement, p);
//     })];
// }



// const seenTypes = new Set<React.ReactElement['type']>();

type PlaceholderElement = React.ReactElement<{
    className?: string,
    children?: React.ReactNode,
    'data-media-id': string,
    'data-media-use-fallback'?: 'true' | 'false',
    'data-media-kind'?: string,
    'data-media-props'?: string
}, 'div'>;

function createReplacement(placeholder: PlaceholderElement): React.ReactElement<ProjectMediaProps, typeof ProjectMedia> {
    const propsStr = placeholder.props['data-media-props'];
    const props = propsStr && JSON.parse(propsStr) as React.ComponentProps<'div'>;
    return <ProjectMedia 
        key={placeholder.key}
        id={placeholder.props["data-media-id"]} 
        kind={(placeholder.props['data-media-kind'] || undefined) as ProjectMediaType | undefined} 
        useFallback={placeholder.props['data-media-use-fallback'] === 'true'}
        {...props}
    />
}

const replacePlaceholder = (node: React.ReactElement) => {
    // if(!seenTypes.has(node.type)) {
    //     console.log(node.type);
    //     seenTypes.add(node.type);
    // }
    if(node.type !== 'div') return node;
    const props = node.props as {className?: string};
    if(props.className !== 'project-media-placeholder') return node;

    return createReplacement(node as PlaceholderElement);
}



export default function ProjectProvider({project, children}: ProjectProviderProps & Omit<React.ComponentProps<typeof ProjectContext.Provider>, 'value'>) {
    
    const transformedChildren = React.useMemo(()=>{
        // console.log(children);
        return transformTree(children, replacePlaceholder);
    }, [children]);

    const {dispatch} = useCaptionedLightbox();
    
    const openLightbox = React.useCallback((key: string, source: React.JSX.Element | string, caption?: React.JSX.Element | null)=>{

        dispatch({type: 'CLEAR_PROJECT'});
        dispatch({type: 'SET_CONTENT', sourceKey: key, sources: [source], captions: [caption || null]});
        dispatch({type: 'OPEN', slide: 0});
    }, [dispatch]);
    
    
    // React.useInsertionEffect(()=>{
    //     if(!children || typeof children !== 'object') return;
    //     if(children instanceof Element) {
    //     // @ts-expect-error Checking if iterable
    //     } else if(typeof children[Symbol.iterator] === 'function') {
    //     } else {
    //         console.warn('Could not replace placeholders in children:', children);
    //     }
    // }, [children]);
    
    // const divRef = React.useRef<HTMLDivElement>(null);
    // // const lastChildren = React.useRef<typeof children>(children);
    // const lastDiv = React.useRef<HTMLDivElement | null>(null);

    // const placeholders = React.useRef<Element[]>([]);
    // const [replacements, setReplacements] = React.useState<React.ReactNode[]>([]);
    // const replacementRefs = React.useRef<React.RefObject<HTMLElement|null>[]>([]);
    // replacementRefs.current = replacements.map((_,i)=>replacementRefs.current[i] ?? React.createRef());

    // // React.useLayoutEffect(()=>{
    // //     const div = divRef.current;
    // //     if(!div || lastDiv.current === div) return;
    // //     // console.log('Placeholders:' ,placeholders);
    // //     // replacePlaceholders(div);
    // //     const [placeholders_, replacements] = getReplacements(div, replacementRefs)
    // //     placeholders.current = placeholders_;
    // //     console.log('Setting replacements:', replacements);
    // //     setReplacements(replacements);
    // //     lastDiv.current = div;
    // // }, [setReplacements]);


    // // React.useEffect(()=>{
    // //     const div = divRef.current;
    // //     if(!div) return;
    // //     if(!replacements?.length) return;
    // //     // console.log('REPLACEMENTS CHANGED:', replacements, divRef.current, replacements?.length);
    // //     replacementRefs.current.forEach((rref, i) => {
    // //         const placeholder = placeholders.current[i];
    // //         console.log('SWAPPING:', placeholder, rref.current);
    // //         // div.replaceChild(placeholder, rref.current);
    // //     });
    // // });


    // // useDomReady(()=>{
    // //     const div = divRef.current;
    // //     if(!div) return;
    // //     if(!replacements?.length) return;
    // //     // console.log('REPLACEMENTS CHANGED:', replacements, divRef.current, replacements?.length);
    // //     replacementRefs.current.forEach((rref, i) => {
    // //         const placeholder = placeholders.current[i];
    // //         console.log('SWAPPING:', placeholder, rref.current);
    // //         // div.replaceChild(placeholder, rref.current);
    // //     });

    // // })

    return <ProjectContext.Provider value={{project, openLightbox}}>
        {/* <div ref={divRef}>{children}</div> */}
        {/* {replacements} */}
        {transformedChildren}
    </ProjectContext.Provider>
}