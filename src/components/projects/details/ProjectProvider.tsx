import React from "react";
import type { ProjectMediaType } from "../types";
import {ProjectMedia, type ProjectMediaProps} from "./ProjectMedia";
import ProjectProviderBase from "./ProjectProviderBase";

type PlaceholderElement = React.ReactElement<{
    className?: string,
    children?: React.ReactNode,
    'data-media-id': string,
    'data-media-use-fallback'?: 'true' | 'false',
    'data-media-kind'?: string,
    'data-media-props'?: string,
    'data-react-key': string,
}, 'div'>;

function createReplacement(placeholder: PlaceholderElement): React.ReactElement<ProjectMediaProps, typeof ProjectMedia> {
    const propsStr = placeholder.props['data-media-props'];
    const props = propsStr && JSON.parse(propsStr) as React.ComponentProps<'div'>;
    return <ProjectMedia 
        key={placeholder.key}
        data-react-key={placeholder.key}
        id={placeholder.props["data-media-id"]} 
        kind={(placeholder.props['data-media-kind'] || undefined) as ProjectMediaType | undefined} 
        useFallback={placeholder.props['data-media-use-fallback'] === 'true'}
        {...props}
    />
}

const replacePlaceholder = (node: React.ReactElement) => {
    if(node.type !== 'div') return node;
    const props = node.props as {className?: string};
    if(props.className !== 'project-media-placeholder') return node;

    return createReplacement(node as PlaceholderElement);
}


export type ProjectProviderProps = Omit<React.ComponentProps<typeof ProjectProviderBase>, 'replacePlaceholder'>;
export default function ProjectProvider(props: ProjectProviderProps) {
    return <ProjectProviderBase replacePlaceholder={replacePlaceholder} {...props} />
}