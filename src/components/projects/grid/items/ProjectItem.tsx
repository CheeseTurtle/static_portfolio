import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, type MouseEvent, type MouseEventHandler, type PointerEventHandler, type RefAttributes } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ProjectInfo, TagKey } from "../../types";
import { BadgeRows } from "./badges/BadgeRows";
import { convertToBadgeType, type BadgeType } from "./badges/badgeTypes";
import ExpandedPart from "./expansion/ExpandedPart";
import { gsap } from "gsap";
import { ImageRow } from './expansion/ImageRow';
import { useBrowserContext } from "../../filtering/common/browserContext";
import { ThumbnailRow } from "./expansion/ThumbnailRow";
import { useCaptionedLightbox } from "../../lightbox";

export interface ProjectItemHandle {
    onClick: (evt: MouseEvent<HTMLDivElement>) => void;
    scrollIntoView: (jump?: boolean) => void,
    // setUpLightbox: () => boolean,
}

type ProjectItemProps = {
    refIndex: number,
    project: ProjectInfo;
    projectIndex: number; // Index in the visible projects array
    activeProject: ProjectInfo | null;
    activeProjectId: string | null;
    activeProjectIndex: number | null;
    openProjectId: string | null;
    carouselOpen: boolean;
    clickItem: (itemId: string, itemIndex: number, newState?: 'active' | 'open') => void;
    setCarouselOpen: (open: boolean) => void;
    extraRef?: React.RefObject<HTMLDivElement | null>,
    scrollContainer: React.RefObject<HTMLDivElement | null>,
};

export type ProjectItemElement = React.ReactElement<ProjectItemProps & RefAttributes<ProjectItemHandle>>;

// type x = RefAttributes<ProjectItemHandle>['ref'];


// export type ProjectItemElement = React.ReactElement<React.ComponentProps<typeof ProjectItem>>;

// export type ProjectItemElement = React.ComponentClass<React.ComponentPropsWithRef<typeof ProjectItem>>;

const ProjectItem = forwardRef<ProjectItemHandle, ProjectItemProps>(({ 
// const ProjectItem = (({ 
    project,
    projectIndex,
    // activeProject,
    activeProjectId, 
    // activeProjectIndex,
    // openProjectId,
    carouselOpen,
    clickItem,
    // setCarouselOpen,
    extraRef: extraRef_,
    scrollContainer,
    // ref
// }: ProjectItemProps & {ref?: React.Ref<ProjectItemHandle>}) => {
}: ProjectItemProps, ref) => {
    const { id, lightboxData, title, date, summary, description, tags } = project;

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

    // Item is expanded if it's the active project
    const expanded = useMemo(() => {
        return id === activeProjectId;
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
        clickItem(id, projectIndex, isMouse ? 'open' : undefined);
    }, [id, projectIndex, clickItem]);



    // const getBoundingClientRect = useCallback(()=>{
    //     const selfRect = selfRef.current.getBoundingClientRect();
    //     if(expanded || !extraRef.current)
    //         return selfRect;
    //     if(!expanded && extraRef.current) {
    //         selfRect.bottom += extraRef.current.scrollHeight;

    //     }



    // }, [expanded]);

    const dispatch = useCaptionedLightbox().dispatch;
    // const setUpLightbox = useCallback(()=>{
    //     if(activeProjectId !== id) return false;
    //     if(!lightboxData?.lightboxSources.length) return false;
    //     dispatch({type: 'SET_CONTENT', sources: lightboxData?.lightboxSources, captions: lightboxData.lightboxCaptions});
    //     return true;
    // }, [activeProjectId, id, dispatch, lightboxData]);

    useImperativeHandle(ref, () => ({ 
        // setUpLightbox,
        scrollIntoView(jump?: boolean) {
            const self = selfRef.current, container = scrollContainer.current;
            // console.log('self, container:', self, container);
            if(!self || !container) return;

            const selfRect_ = self.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            let diffHeight: number;
            console.log('expanded:', expanded, extraRef.current ? extraRef.current.scrollHeight - extraRef.current.clientHeight : null);
            const selfRect: DOMRect = (!expanded && extraRef.current && (diffHeight = extraRef.current.scrollHeight - extraRef.current.clientHeight) > 0) ? (
                new DOMRect(selfRect_.x, selfRect_.y, selfRect_.width, selfRect_.height + diffHeight)
            ) : selfRect_;

            // console.log(selfRect, containerRect, self, container);
            // console.log((['top','bottom','left','right'] as ('top' | 'bottom' | 'left' | 'right')[]).map(x=>
            //     `${selfRect[x].toFixed(4).padStart(9, ' ')} | ${containerRect[x].toFixed(4).padStart(9, ' ')}`
            // ).join('\n'))
            
            // If it is in view already, then don't scroll.
            // if(containerRect.top < selfRect.bottom && (selfRect.bottom < containerRect.bottom || selfRect.top < containerRect.bottom)
            //     && containerRect.left < selfRect.right && (selfRect.right < containerRect.right || selfRect.left < containerRect.right)
            // ) //     return;


            const MIN_Y_VISIBLE = Math.min(containerRect.height, 0.8 * selfRect.height);
            const MIN_X_VISIBLE = Math.min(containerRect.width, 0.8 * selfRect.width);

            const ALLOWABLE_MISSED_Y = Math.min(-(selfRect.height - containerRect.height), 0);
            const ALLOWABLE_MISSED_X = Math.min(-(selfRect.width - containerRect.width), 0);

            console.log(`(selfRect.bottom - containerRect.top >= MIN_Y_VISIBLE) <==> (${selfRect.bottom} - ${containerRect.top} >= ${MIN_Y_VISIBLE}) <==> ${selfRect.bottom - containerRect.top >= MIN_Y_VISIBLE}`);
            console.log(`(containerRect.bottom - selfRect.bottom >= ALLOWABLE_MISSED_Y) <==> (${containerRect.bottom} - ${selfRect.bottom} >= ${ALLOWABLE_MISSED_Y}) <==> ${containerRect.bottom - selfRect.bottom >= ALLOWABLE_MISSED_Y}`);
            console.log(`(containerRect.bottom - selfRect.top >= MIN_Y_VISIBLE) <==> (${containerRect.bottom} - ${selfRect.top} >= ${MIN_Y_VISIBLE}) <==> ${containerRect.bottom - selfRect.top >= MIN_Y_VISIBLE}`);
            if(((selfRect.bottom - containerRect.top >= MIN_Y_VISIBLE) && ((containerRect.bottom - selfRect.bottom >= ALLOWABLE_MISSED_Y) && (containerRect.bottom - selfRect.top >= MIN_Y_VISIBLE)))
                && ((selfRect.right - containerRect.left >= MIN_X_VISIBLE) && ((containerRect.right - selfRect.right >= ALLOWABLE_MISSED_X) && (containerRect.right - selfRect.left >= MIN_X_VISIBLE)))
            ) return;



            // const selfBottom = self.clientTop + self.clientHeight;
            // const containerBottom = Math.min(container.scrollTop + container.clientHeight, container.scrollHeight);
            selfRef.current?.scrollIntoView({behavior: jump ? "instant" : (jump === false ? "smooth" : "auto")});
            // // selfRef.current?.scrollTo()
        },
        onClick }), [onClick, scrollContainer, expanded, extraRef]);

    // const maybeScrollIntoView = useCallback(()=>{
    //     if(!carouselOpen) return;

    // }, [carouselOpen]);

    // Handle expand/collapse animation
    useEffect(() => {
        const el = extraRef.current;
        if (!el) return;

        if (expanded) {
            // Expand: animate from 0 to scrollHeight
            gsap.killTweensOf(el);
            gsap.fromTo(
                el,
                { height: el.clientHeight, opacity: el.style.opacity },
                {
                    height: el.scrollHeight,
                    opacity: 1,
                    duration: 0.3,
                    ease: "power1.out",
                    onComplete: () => { 
                        gsap.set(el, { height: "auto" });
                    },
                }
            );
        } else if (el.clientHeight !== 0) {
            // Collapse: animate from current height to 0
            gsap.killTweensOf(el);
            const currentHeight = el.clientHeight;
            gsap.fromTo(
                el,
                { height: currentHeight, opacity: el.style.opacity },
                { height: 0, opacity: 0, duration: 0.3, ease: "power1.in" }
            );
        }
    }, [id, expanded, extraRef]);

    const onHover: PointerEventHandler<HTMLDivElement> = useCallback((evt) => {
        if(carouselOpen) return;
        const pointerType = evt.pointerType;
        const isMouse = pointerType === 'mouse';
        if(!isMouse) return;
        clickItem(id, projectIndex, 'active');
    }, [clickItem, carouselOpen, projectIndex, id]);

    const onUnhover: PointerEventHandler<HTMLDivElement> =  useCallback((evt) => {
        if(carouselOpen) return;
        const pointerType = evt.pointerType;
        const isMouse = pointerType === 'mouse';
        if(!isMouse) return;
        // clickItem(id, projectIndex, 'active');
        clearActiveItem();
    }, [clearActiveItem, carouselOpen]);


    const handleThumbClick = useCallback((evt: MouseEvent<HTMLImageElement | HTMLDivElement>, index: number) => {
        // console.log('THUMB CLICK', lightboxData, index);
        if(!lightboxData?.lightboxSources?.length) return;
        evt.preventDefault();
        evt.stopPropagation();
        dispatch({type: 'SET_CONTENT', sourceKey: id, sources: lightboxData.lightboxSources, captions: lightboxData.lightboxCaptions});
        // console.log('OPENING LIGHTBOX');
        dispatch({type: 'OPEN', slide: index + 1});
    }, [dispatch, lightboxData, id]);

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
            `}
        >
            {/* Header */}
            <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold">{title}</span>
                    <span className="text-sm text-muted-foreground">{year}</span>
                </CardTitle>
                <div>{project.category.toUpperCase()}</div>
            </CardHeader>

            {/* Content */}
            <CardContent className='space-y-2'>
                {/* Description */}
                <p className="text-sm text-muted-foreground">{description}</p>

                {/* Category-based tags */}
                <BadgeRows badgeRows={badgeRows} />

                {/* Expanded content */}
                {summary && (
                    <ExpandedPart ref={extraRef}>
                        {summary}
                        {lightboxData && lightboxData.lightboxSources.length > 0 && (
                            // <ImageRow images={images} />
                            <ThumbnailRow items={lightboxData.lightboxSources} onImageClick={handleThumbClick} />
                        )}
                    </ExpandedPart>
                )}
            </CardContent>
        </Card>
    );
});

export default ProjectItem;
