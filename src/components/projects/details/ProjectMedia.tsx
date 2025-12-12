import React from "react";
import { useProjectLightboxData } from "./useProject";
import type { ProjectInfoForProvider } from "./ProjectProviderBase";
import type { LightboxMediaEntry, ProjectMediaEmbedData, ProjectMediaType } from "../types";
import { cn } from "@/lib/utils";
// import { getYouTubeVideoID } from "./getYoutubeThumbnail";
// import YouTube from 'react-youtube';
// import ReactPlayer from 'react-player';
const ReactPlayer = React.lazy(()=>import('react-player'));



export type ProjectMediaProps = React.ComponentPropsWithRef<'div'> & {
    id: string,
    kind?: 'image' | 'content'  | 'embed',
    useFallback?: boolean,
};


type LightboxData = Exclude<ProjectInfoForProvider['lightboxData'], undefined>

function findLightboxEntry<T extends ProjectMediaType>(type: T, data: LightboxData, id: string): LightboxMediaEntry<T> | undefined {
    return data.record[type]?.[id];
}


function findLightboxMedia<K extends ProjectMediaType>(data: LightboxData | undefined, id: string, kind?: K): [K, LightboxMediaEntry<K>] | [K | undefined, undefined] {
    if(!data) return [undefined, undefined];
    const unknownKind = kind === undefined;
    if(unknownKind || kind === 'image') {
        const result = findLightboxEntry('image', data, id);
        if(result) return ['image' as K, result as LightboxMediaEntry<K>];
        if(kind === 'image') return [kind, undefined];
    }
    if(unknownKind || kind === 'embed') {
        const result = findLightboxEntry('embed', data, id);
        if(result) return ['embed' as K, result as LightboxMediaEntry<K>];
        if(kind === 'embed') return [kind, undefined];
    }
    if(unknownKind || kind === 'content') {
        const result = findLightboxEntry('content', data, id);
        if(result) return ['content' as K, result as LightboxMediaEntry<K>];
        if(kind === 'content') return [kind, undefined];
    }
    return [undefined, undefined];
}

export function createEmbed(source: ProjectMediaEmbedData, _lazyLoad?: boolean) {
    if(source.provider !== 'youtube')
        throw new TypeError("Currently the only supported Embed provider is 'youtube'");
    // const videoId = getYouTubeVideoID(source.path);
    // // const embed = <LiteYouTubeEmbed id={videoId} title={source.title ?? 'video title here'} lazyLoad={lazyLoad}></LiteYouTubeEmbed>;
    // const embed =  <div className="w-full aspect-video" id={`container-${CSS.escape(source.path)}`}>
    //   <YouTube
    //     id={`player-${CSS.escape(source.path)}`}
    //     videoId={videoId}
    //     opts={{
    //       width: '100%',
    //       height: '100%',
    //       playerVars: {
    //         autoplay: 0,
    //       },
    //     }}
    //     className="w-full h-full"
    //   />
    // </div>
    const embed = <div className="w-full aspect-video flex content-center text-center justify-stretch justify-items-stretch items-stretch align-middle">
        <ReactPlayer src={source.path} light controls

            onError={(evt)=>{
                console.error(evt);                
            }}
            style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
        />
    </div>
    // const embed = <iframe id="ytplayer" width="640" height="360"
    //     src="https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&origin=http://example.com"
    //     frameborder="0">
    // </iframe>
    console.info('EMBED:', embed);
    return embed;
}

const MissingMediaPlaceholder = React.memo((props: {id: string}) => {
    return <div>
        Missing media item: {props.id}
    </div>
});

export const ProjectMedia = React.memo(({id, kind, useFallback = true, className, ...props}: ProjectMediaProps)=>{
    const [lightboxData, openLightbox] = useProjectLightboxData();
    const mediaItem = React.useMemo(()=>{
        const [mediaType, mediaEntry] = findLightboxMedia(lightboxData, id, kind);
        if(!mediaEntry) {
            if(useFallback) return <MissingMediaPlaceholder id={id}></MissingMediaPlaceholder>;
            return null;
        }
        let source: React.JSX.Element, caption: React.JSX.Element | null = null;
        switch(mediaType) {
            case 'content': {
                source = mediaEntry.source as React.JSX.Element;
                break;
            }
            case 'embed': {
                source = createEmbed(mediaEntry.source as unknown as ProjectMediaEmbedData);
                // source = (mediaEntry.source as {path: string}).path
                break;
            }
            case 'image': {
                source = <img src={mediaEntry.source as string}></img>;
                break;
            }
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new TypeError(`Invalid mediaType: '${mediaType}'`);
        }
        if(mediaEntry.caption) {
            if(typeof mediaEntry.caption === 'string')
                caption = <p>{mediaEntry.caption}</p>;
            else
                caption = (mediaEntry.caption ?? null) as React.JSX.Element | null;
        }
        const thumbnail = (()=>{
            console.log('Thumbnail:', mediaEntry.thumbnail);
            if(!mediaEntry.thumbnail) return React.cloneElement(source);
            
            if(typeof mediaEntry.thumbnail === 'string')
                return <img src={mediaEntry.thumbnail} />;
            return mediaEntry.thumbnail;
        })();

        return <div className="project-media-aside float-left">
            <div className="project-media-aside-inner m-2">
                <div onClickCapture={(evt)=>{
                    openLightbox?.(mediaEntry.id, mediaType === 'embed' ? (mediaEntry.source as {path: string}).path : source, caption);
                    evt.stopPropagation();
                }}>{thumbnail}</div>
                <div>{caption}</div>
            </div>
        </div>
    }, [id, kind, lightboxData, useFallback, openLightbox]);

    if(!mediaItem) return null;
    return <div className={cn(className)} {...props}>{mediaItem}</div>;
});



export const ProjectMediaPlaceholder = ({id, kind, useFallback = true, ...props}: ProjectMediaProps) => {
    return <div className="project-media-placeholder" data-media-id={id} data-media-kind={kind} data-media-use-fallback={useFallback} data-media-props={JSON.stringify(props)}>
        (Placeholder for media item {id})
    </div>
};

export default ProjectMediaPlaceholder;