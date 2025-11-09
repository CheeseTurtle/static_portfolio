import type { MDXInstance } from "astro";
import type { ReactNode } from "react";

import type { VNode, ContentMarkerProps, ImageMarkerProps, MarkdownMarkerProps } from "./util/types/types";

import { v4 as uuidv4 } from "uuid";


function isImageMarker(p: ContentMarkerProps): p is ImageMarkerProps {
    return 'imageName' in p && typeof(p.imageName) === 'string';
}
function isMarkdownMarker(p: ContentMarkerProps): p is MarkdownMarkerProps {
    return 'contentFile' in p && typeof(p.contentFile) === 'string';
}



export default function ContentMarker(props: ContentMarkerProps) { //, state?: Readonly<any>) {
    if(props === undefined) { throw new Error("ContentMarker has no props!") }
    const id = uuidv4();


    function makeSpan(): VNode<HTMLSpanElement> {
        if(props.children !== undefined) {
            return <span className='content-marker' data-content-markup={props.children} data-marker-id={id}></span>;
        } else if(isImageMarker(props)) {
            return <span className='content-marker' data-content-image={props.imageName} data-marker-id={id}></span>;
        } else if(isMarkdownMarker(props)) {
            return <span className='content-marker' data-content-file={props.contentFile} data-marker-id={id}></span>;
        } else {
            throw new Error("Empty ContentMarker without `imageName` or `contentFile`");
        }
    }

    const spanElem = makeSpan();

    // useEffect(()=>{
    //     // console.log(spanElem, spanElem.props);
    //     // @ts-ignore
    //     spanElem.props['data-marker-id'] = id;
    //     console.log(self, spanElem);
    // }, [spanElem, id]);

    return spanElem;
}