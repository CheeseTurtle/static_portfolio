import type { MDXInstance } from "astro";
import { Component, Fragment, type Attributes, type ComponentChildren, type Context, type Ref, type RenderableProps, type VNode } from "preact";
import { useContext, useDebugValue, useEffect, useErrorBoundary, useId, useMemo } from "preact/hooks";
import type {Node as VisitedNode} from "unist";

interface PropsBase {
    // sectionId: string;
    children?: ComponentChildren;
}
interface ImageMarkerProps extends PropsBase {
    imageName?: string;
};
interface MarkdownMarkerProps extends PropsBase {
    contentFile?: string;
}

interface ElemMarkerProps extends PropsBase {
    children: ComponentChildren;
}

export type ContentMarkerProps = MarkdownMarkerProps|ImageMarkerProps|ElemMarkerProps;


// export default function ContentMarker(props: Props) {
//     useEffect(()=>{

//     });
// }

function isImageMarker(p: ContentMarkerProps): p is ImageMarkerProps {
    return 'imageName' in p && typeof(p.imageName) === 'string';
}
function isMarkdownMarker(p: ContentMarkerProps): p is MarkdownMarkerProps {
    return 'contentFile' in p && typeof(p.contentFile) === 'string';
}

export type ContentMarkerData = [VisitedNode, string|Element, boolean];
export type ContentMarkerDataEntry = [string,ContentMarkerData];

export type FullContentMarkerData = [MDXInstance<StorySectionFrontmatter>,VisitedNode, string|Element, boolean];
export type FullContentMarkerDataEntry = [string,FullContentMarkerData];

export default function ContentMarker(props: ContentMarkerProps, state?: Readonly<any>) {
    if(props === undefined) { throw "ContentMarker has no props!" }
    const id = useId();
    // useEffect(() => {
    //     const id = useId();        
    //     // const mySpanElem = get_span_elem();
    //     mySpanElem.id = id;

    //     // // Cleanup
    //     // return () => {
            
    //     // };
    // }, []);


    function makeSpan(): VNode<HTMLSpanElement> {
        if(props.children !== undefined) {
            return <span class='content-marker' data-content-markup={props.children} data-marker-id={id}></span>;
        } else if(isImageMarker(props)) {
            return <span class='content-marker' data-content-image={props.imageName} data-marker-id={id}></span>;
        } else if(isMarkdownMarker(props)) {
            return <span class='content-marker' data-content-file={props.contentFile} data-marker-id={id}></span>;
        } else {
            throw "Empty ContentMarker without `imageName` or `contentFile`"
        }
    }

    const spanElem = makeSpan();
    return spanElem;
}