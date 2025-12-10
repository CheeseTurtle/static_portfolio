import React, { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, type MouseEvent, type MouseEventHandler, type PointerEventHandler, type RefAttributes } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ProjectInfo, TagKey } from "../../types";
import { BadgeRows } from "./badges/BadgeRows";
import { convertToBadgeType, type BadgeType } from "./badges/badgeTypes";
import ExpandedPart from "./expansion/ExpandedPart";
import { useBrowserContext } from "../../filtering/common/browserContext";
import { ThumbnailRow } from "./expansion/ThumbnailRow";
import { useCaptionedLightbox } from "../../lightbox";


function adaptLightboxData(data: ProjectInfo['lightboxData']) {
    if(!data) return undefined;
    const sources = data.lightboxSources.map(x=>(
        typeof x === 'string' ? x : <>{x}</>
    ));
    const captions = data.lightboxCaptions?.map(x=>
        x ? (
            typeof x === 'string' ? x : <>{x}</>
        ) : null
    );
    return {sources, captions, thumbnails: data.lightboxThumbs};
}



export interface ProjectItemHandle {
    onClick: (evt: MouseEvent<HTMLDivElement>) => void;
    scrollIntoView: (jump?: boolean) => void,
    // setUpLightbox: () => boolean,
}

type ProjectItemProps = {
    refIndex: number,
    project: ProjectInfo;
    projectIndex: number; // Index in the visible projects array
    // activeProject: ProjectInfo | null;
    activeProjectId: string | null;
    // activeProjectIndex: number | null;
    openProjectId: string | null;
    carouselOpen: boolean;
    // lightboxOpen: boolean;
    clickItem: (itemId: string, itemIndex: number, newState?: 'active' | 'open') => void;
    // setCarouselOpen: (open: boolean) => void;
    extraRef?: React.RefObject<HTMLDivElement | null>,
    scrollContainer: React.RefObject<HTMLDivElement | null>,
};

export type ProjectItemElement = React.ReactElement<ProjectItemProps & RefAttributes<ProjectItemHandle>>;

// type x = RefAttributes<ProjectItemHandle>['ref'];


// export type ProjectItemElement = React.ReactElement<React.ComponentProps<typeof ProjectItem>>;

// export type ProjectItemElement = React.ComponentClass<React.ComponentPropsWithRef<typeof ProjectItem>>;

const ProjectItem = memo(forwardRef<ProjectItemHandle, ProjectItemProps>(({ 
// const ProjectItem = (({ 
    project,
    projectIndex,
    activeProjectId, 
    carouselOpen,
    clickItem,
    extraRef: extraRef_,
    scrollContainer,
    // ref
// }: ProjectItemProps & {ref?: React.Ref<ProjectItemHandle>}) => {
}: ProjectItemProps, ref) => {
    const [isPending, startTransition] = React.useTransition();
    const { id, lightboxData: lightboxData_, title, date, summary, description, tags } = project;
    const lightboxData = adaptLightboxData(lightboxData_);

    const clearActiveItem = useBrowserContext(s=>s.clearActiveItem);

    const year = useMemo(() => (date.explicitDate?.year ?? date.getFullYear()), [date]);
    const selfRef = useRef<HTMLDivElement>(null);
    const localExtraRef = useRef<HTMLDivElement>(null);

    const extraRef = useMemo(()=>extraRef_ ?? localExtraRef, [extraRef_]);

    const newEntries = useMemo(() => Object.entries(tags || {}).map(([k, vs]) => {
        const newKey = convertToBadgeType(k as TagKey);
        return [newKey, vs];
    }), [tags]);
    
    const badgeRows = useMemo(
        () => (newEntries.length > 0 ? Object.fromEntries(newEntries) : {}) as Record<BadgeType, Set<string>>, 
        [newEntries]
    );

    const {state: lightboxState, dispatch: lightboxDispatch} = useCaptionedLightbox();
    const {open: lightboxOpen} = lightboxState;

    
    // Item is expanded if it's the active project
    const expanded = useMemo(() => {
        return (id === activeProjectId);
    }, [id, activeProjectId]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback((evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        const pointerType = (evt.nativeEvent as PointerEvent).pointerType;
        const isMouse = pointerType === 'mouse';
        console.log('%cItem clicked:', 'color: black; background-color: yellow;', id, projectIndex, window.location.search);
        
        // Use the clickItem action from the store
        // This handles both:
        // 1. Clicking an already-active item (opens carousel)
        // 2. Clicking a different item (makes it active)
        // startTransition(() => {
            clickItem(id, projectIndex, isMouse ? 'open' : undefined);
        // });
    }, [id, projectIndex, clickItem]);

    useImperativeHandle(ref, () => ({ 
        scrollIntoView(jump?: boolean) {
            startTransition(()=>{
                const self = selfRef.current, container = scrollContainer.current;
                // console.log('self, container:', self, container);
                if(!self || !container) return;

                const selfRect_ = self.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                let diffHeight: number;
                // console.log('expanded:', expanded, extraRef.current ? extraRef.current.scrollHeight - extraRef.current.clientHeight : null);
                const selfRect: DOMRect = (!expanded && extraRef.current && (diffHeight = extraRef.current.scrollHeight - extraRef.current.clientHeight) > 0) ? (
                    new DOMRect(selfRect_.x, selfRect_.y, selfRect_.width, selfRect_.height + diffHeight)
                ) : selfRect_;

                const MIN_Y_VISIBLE = Math.min(containerRect.height, 0.8 * selfRect.height);
                const MIN_X_VISIBLE = Math.min(containerRect.width, 0.8 * selfRect.width);

                const ALLOWABLE_MISSED_Y = Math.min(-(selfRect.height - containerRect.height), 0);
                const ALLOWABLE_MISSED_X = Math.min(-(selfRect.width - containerRect.width), 0);

                // console.log(`(selfRect.bottom - containerRect.top >= MIN_Y_VISIBLE) <==> (${selfRect.bottom} - ${containerRect.top} >= ${MIN_Y_VISIBLE}) <==> ${selfRect.bottom - containerRect.top >= MIN_Y_VISIBLE}`);
                // console.log(`(containerRect.bottom - selfRect.bottom >= ALLOWABLE_MISSED_Y) <==> (${containerRect.bottom} - ${selfRect.bottom} >= ${ALLOWABLE_MISSED_Y}) <==> ${containerRect.bottom - selfRect.bottom >= ALLOWABLE_MISSED_Y}`);
                // console.log(`(containerRect.bottom - selfRect.top >= MIN_Y_VISIBLE) <==> (${containerRect.bottom} - ${selfRect.top} >= ${MIN_Y_VISIBLE}) <==> ${containerRect.bottom - selfRect.top >= MIN_Y_VISIBLE}`);
                if(((selfRect.bottom - containerRect.top >= MIN_Y_VISIBLE) && ((containerRect.bottom - selfRect.bottom >= ALLOWABLE_MISSED_Y) && (containerRect.bottom - selfRect.top >= MIN_Y_VISIBLE)))
                    && ((selfRect.right - containerRect.left >= MIN_X_VISIBLE) && ((containerRect.right - selfRect.right >= ALLOWABLE_MISSED_X) && (containerRect.right - selfRect.left >= MIN_X_VISIBLE)))
                ) return;

                // const selfBottom = self.clientTop + self.clientHeight;
                // const containerBottom = Math.min(container.scrollTop + container.clientHeight, container.scrollHeight);
                selfRef.current?.scrollIntoView({behavior: jump ? "instant" : (jump === false ? "smooth" : "auto")});
                // // selfRef.current?.scrollTo()
            });
        },
        onClick }), [onClick, scrollContainer, expanded, extraRef]);

    /*
    // const lightboxIsOpen = useEffectEvent(()=>lightboxOpen);

    // // Handle expand/collapse animation
    // useEffect(() => {
    //     const el = extraRef.current;
    //     if (!el) return;

    //     console.log(`PROJECT ITEM '${id}' EXPANDED:`, expanded, lightboxIsOpen());

    //     if (expanded) {
    //         // Expand: animate from 0 to scrollHeight
    //         gsap.killTweensOf(el);
    //         gsap.fromTo(
    //             el,
    //             { height: el.clientHeight, opacity: el.style.opacity },
    //             {
    //                 height: el.scrollHeight,
    //                 opacity: 1,
    //                 duration: 0.3,
    //                 ease: "power1.out",
    //                 onComplete: () => { 
    //                     gsap.set(el, { height: "auto" });
    //                 },
    //             }
    //         );
    //     } else if (el.clientHeight !== 0) {
    //         // Collapse: animate from current height to 0
    //         gsap.killTweensOf(el);
    //         const currentHeight = el.clientHeight;
    //         gsap.fromTo(
    //             el,
    //             { height: currentHeight, opacity: el.style.opacity },
    //             { height: 0, opacity: 0, duration: 0.3, ease: "power1.in" }
    //         );
    //     }
    // }, [id, expanded, extraRef]);
    */

    const shouldExpand = React.useRef<boolean>(false);

    const onHover: PointerEventHandler<HTMLDivElement> = useCallback((evt) => {
        // console.log(`PROJECT ITEM '${id}' HOVERED`, {carouselOpen, lightboxOpen, lightboxData});
        if(carouselOpen || lightboxOpen) return;
        const pointerType = evt.pointerType;
        const isMouse = pointerType === 'mouse';
        if(!isMouse) return;
        shouldExpand.current = true;
        startTransition(()=>{if(shouldExpand.current) clickItem(id, projectIndex, 'active')});
    }, [clickItem, carouselOpen, lightboxOpen, projectIndex, id]);

    const onUnhover: PointerEventHandler<HTMLDivElement> =  useCallback((evt) => {
        // console.log(`PROJECT ITEM '${id}' UNHOVERED`, {carouselOpen, lightboxOpen});
         if(carouselOpen || lightboxOpen) return;
        const pointerType = evt.pointerType;
        const isMouse = pointerType === 'mouse';
        if(!isMouse) return;
        shouldExpand.current = false;
        startTransition(()=>{if(!shouldExpand.current) clearActiveItem()});
    }, [clearActiveItem, carouselOpen, lightboxOpen]);


    const handleThumbClick = useCallback((evt: MouseEvent<HTMLImageElement | HTMLDivElement>, index: number) => {
        // console.log('THUMB CLICK', lightboxData, index);
        // console.log(`PROJECT ITEM '${id}' THUMB #${index + 1} CLICKED`);
        if(!lightboxData?.sources?.length) return;
        evt.preventDefault();
        evt.stopPropagation();
        lightboxDispatch({type: 'SET_PROJECT', projectId: id, projectIndex});
        lightboxDispatch({type: 'SET_CONTENT', sourceKey: id, ...lightboxData});
        lightboxDispatch({type: 'OPEN', slide: index + 1});
    }, [lightboxDispatch, lightboxData, id, projectIndex]);

    // const fallback = <div className="w-full min-h-20 h-max bg-blue-500">
    //     {
    //         [0].map(()=>{
    //             console.log('Fallback element');
    //             return null;
    //         })
    //     }
    //     (Placeholder)...
    //     </div>;

    return (
        <Card 
            ref={selfRef}
            onClick={onClick}
            onPointerEnter={onHover}
            onPointerLeave={onUnhover}
            className={`
                relative cursor-pointer overflow-hidden transition-all
                hover:shadow-lg
                ${expanded ? "ring-2 ring-primary" : ""}
                ${isPending ? "outline-4 outline-yellow-500" : ""}
            `}
            style={{textWrapMode: "wrap", textWrap: "stable"}}
        >
            {/* Header */}
            <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold">{title}</span>
                    <span className="text-sm text-muted-foreground">{year}</span>
                </CardTitle>
                {/* Description */}
                <p className="text-sm text-muted-foreground">{description}</p>

                {/* Category */}
                <div className="absolute w-full inset-0 flex justify-center h-min rounded-t-xl text-sm select-none pointer-events-none text-gray-900 dark:text-gray-400">
                    
                    {project.category.toUpperCase()}

                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className='space-y-2'>

                {/* Category-based tags */}
                <BadgeRows badgeRows={badgeRows} />

                {/* Expanded content */}
                {summary && (
                    // <Suspense fallback={fallback}>
                        <ExpandedPart id={id} expanded={expanded} ref={extraRef}>
                            {summary}
                            {lightboxData && lightboxData.sources.length > 0 && (
                                <ThumbnailRow items={lightboxData.sources} thumbnails={lightboxData.thumbnails} onImageClick={handleThumbClick} />
                            )}
                        </ExpandedPart>
                    // </Suspense>
                )}
            </CardContent>
        </Card>
    );
}));

export default ProjectItem;
