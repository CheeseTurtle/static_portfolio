import type { MDXInstance } from "astro";
import { Component, Fragment, type Attributes, type ComponentChildren, type Ref, type RenderableProps } from "preact";
import { useEffect, useId, useMemo } from "preact/hooks";
import type {Node as VisitedNode} from "unist";

declare interface PropsBase {
    // sectionId: string;
    children?: ComponentChildren;
}
declare interface ImageMarkerProps extends PropsBase {
    imageName?: string;
};
declare interface MarkdownMarkerProps extends PropsBase {
    contentFile?: string;
}

declare interface ElemMarkerProps extends PropsBase {
    children: ComponentChildren;
}

declare type Props = MarkdownMarkerProps|ImageMarkerProps|ElemMarkerProps;


// export default function ContentMarker(props: Props) {
//     useEffect(()=>{

//     });
// }

function isImageMarker(p: Props): p is ImageMarkerProps {
    return 'imageName' in p && typeof(p.imageName) === 'string';
}
function isMarkdownMarker(p: Props): p is MarkdownMarkerProps {
    return 'contentFile' in p && typeof(p.contentFile) === 'string';
}


export type ContentMarkerData = [VisitedNode, string|Element, boolean];
export type ContentMarkerDataEntry = [string,ContentMarkerData];

export type FullContentMarkerData = [MDXInstance<StorySectionFrontmatter>,VisitedNode, string|Element, boolean];
export type FullContentMarkerDataEntry = [string,FullContentMarkerData];

export default function ContentMarker(props: Props) {
    // render(props?: Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<any> | undefined; }> | undefined, state?: Readonly<{}> | undefined, context?: any): ComponentChildren {
    // render(props?: RenderableProps<Props>, state?: Readonly<any>, context?: any) {

    // render(props: any, state?: any, context?:any) {
    if(props === undefined) { throw "ContentMarker has no props!" }

    const id = useId();
    // console.log("My id:", id, props);

    if(props.children !== undefined) {
        return <Fragment><span class='content-marker' data-content-markup={props.children} data-marker-id={id}></span></Fragment>;
    } else if(isImageMarker(props)) {
        return <Fragment><span class='content-marker' data-content-image={props.imageName} data-marker-id={id}></span></Fragment>;
    } else if(isMarkdownMarker(props)) {
        return <Fragment><span class='content-marker' data-content-file={props.contentFile} data-marker-id={id}></span></Fragment>;
    } else {
        throw "Empty ContentMarker without `imageName` or `contentFile`"
    }
}