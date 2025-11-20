import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, type MouseEvent, type MouseEventHandler, type PointerEventHandler, type ReactElement, type RefAttributes } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ProjectInfo } from "../../types";
import { BadgeRows } from "./badges/BadgeRows";
import { convertToBadgeType, type BadgeType } from "./badges/badgeTypes";
import ExpandedPart from "./expansion/ExpandedPart";
import { gsap } from "gsap";
import { ImageRow } from './expansion/ImageRow';
import { useBrowserContext } from "../../filtering/common/browserContext";

export interface ProjectItemHandle {
    onClick: (evt: MouseEvent<HTMLDivElement>) => void;
}

type ProjectItemProps = {
    project: ProjectInfo;
    projectIndex: number; // Index in the visible projects array
    activeProject: ProjectInfo | null;
    activeProjectId: string | null;
    activeProjectIndex: number | null;
    openProjectId: string | null;
    carouselOpen: boolean;
    clickItem: (itemId: string, itemIndex: number, newState?: 'active' | 'open' | undefined) => void;
    setCarouselOpen: (open: boolean) => void;
    extraRef?: React.RefObject<HTMLDivElement | null>,
};

export type ProjectItemElement = ReactElement<ProjectItemProps & RefAttributes<ProjectItemHandle>>;

const ProjectItem = forwardRef<ProjectItemHandle, ProjectItemProps>(({ 
    project,
    projectIndex,
    activeProject,
    activeProjectId, 
    activeProjectIndex,
    openProjectId,
    carouselOpen,
    clickItem,
    setCarouselOpen,
    extraRef: extraRef_,
}: ProjectItemProps, ref) => {
    const { id, images, title, date, summary, description, tags } = project;

    const clearActiveItem = useBrowserContext(s=>s.clearActiveItem);

    const year = useMemo(() => (date.explicitDate?.year ?? date.getFullYear()), [date]);
    const selfRef = useRef<HTMLDivElement>(null);
    const localExtraRef = useRef<HTMLDivElement>(null);

    const extraRef = useMemo(()=>extraRef_ ?? localExtraRef, [extraRef_]);

    const newEntries = useMemo(() => Object.entries(tags || {}).map(([k, vs]) => {
        const newKey = convertToBadgeType(k);
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

    useImperativeHandle(ref, () => ({ onClick }), [onClick]);

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
    }, [id, expanded]);

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
    }, [clearActiveItem, carouselOpen, projectIndex, id]);

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
                        {images && images.length > 0 && (
                            <ImageRow images={images} />
                        )}
                    </ExpandedPart>
                )}
            </CardContent>
        </Card>
    );
});

export default ProjectItem;