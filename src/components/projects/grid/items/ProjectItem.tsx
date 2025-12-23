import React, { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, type MouseEvent, type MouseEventHandler, type PointerEventHandler, type RefAttributes } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ProjectInfo, TagKey } from "../../types";
import { BadgeRows } from "./badges/BadgeRows";
import { convertToBadgeType, type BadgeType } from "./badges/badgeTypes";
import ExpandedPart from "./expansion/ExpandedPart";
import { useBrowserContext } from "../../filtering/common/browserContext";
import { ThumbnailRow } from "./expansion/ThumbnailRow";
import { useCaptionedLightbox } from "../../lightbox";
import { isEquivalentSet } from "../../util/comparison";


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
}

type ProjectItemProps = {
    refIndex: number,
    project: ProjectInfo;
    projectIndex: number; // Index in the visible projects array
    activeProjectId: string | null;
    // openProjectId: string | null;
    carouselOpen: boolean;
    clickItem: (itemId: string, itemIndex: number, newState?: 'active' | 'open') => void;
    extraRef?: React.RefObject<HTMLDivElement | null>,
    scrollContainer: React.RefObject<HTMLDivElement | null>,
    setSizeChanging: (index: number, changing: boolean) => void,
};

export type ProjectItemElement = React.ReactElement<ProjectItemProps & RefAttributes<ProjectItemHandle>>;

const ProjectItem = memo(forwardRef<ProjectItemHandle, ProjectItemProps>(({ 
    project,
    projectIndex,
    activeProjectId, 
    carouselOpen,
    clickItem,
    extraRef: extraRef_,
    scrollContainer,
    setSizeChanging,
}: ProjectItemProps, ref) => {
    const [isPending, startTransition] = React.useTransition();
    const { id, lightboxData: lightboxData_, title, date, summary, description, tags } = project;
    const lightboxData = adaptLightboxData(lightboxData_);

    const clearActiveItem = useBrowserContext(s=>s.clearActiveItem);

    const dateText = useMemo(()=>{
        const year = date.explicitDate?.year ?? date.getFullYear();
        if(!date.explicitDate?.month)
            return <span className="project-date-year">{year}</span>;
        const node = <><span className="project-date-year">{year}</span>/<span className="project-date-month">{date.explicitDate.month}</span></>
        if(!date.explicitDate?.day)
            return node;
        return <>{node}/<span className="project-date-day">{date.explicitDate.day}</span></>
    }, [date])


    const selfRef = useRef<HTMLDivElement>(null);
    
    const localExtraRef = useRef<HTMLDivElement>(null);
    const extraRef = useMemo(()=>extraRef_ ?? localExtraRef, [extraRef_]);

    const updateBadgeRowsFromTags = React.useCallback((existing: null | Partial<Record<BadgeType, (Set<string> | undefined)>>, tags_: typeof tags)=>{
        let anyTags: boolean = false, anyChange: boolean = false;
        const ret: Partial<Record<BadgeType, (Set<string> | undefined)>> = {}
        
        Object.entries(tags_).forEach(([k,vs])=>{
            const newKey = convertToBadgeType(k as TagKey);
            const oldSet = existing?.[newKey];
            if(!vs?.size) {
                if(oldSet?.size) anyChange = true;
                return;
            };
            anyTags ||= true;
            if(oldSet && isEquivalentSet(oldSet, vs)) {
                ret[newKey] = oldSet;
                return;
            }
            anyChange = true;
            ret[newKey] = vs;
        });

        if(!anyChange) return [existing, false] as [typeof existing, boolean];
        return [anyTags ? ret : null, true] as [typeof ret | null, boolean]
    }, [])

    const [badgeRows, setBadgeRows] = React.useState<null | Partial<Record<BadgeType, (Set<string> | undefined)>>>(null);
    const badgeRowsRef = React.useRef<typeof badgeRows>(badgeRows);
    React.useEffect(()=>{
        const [newRows, anyChange] = updateBadgeRowsFromTags(badgeRowsRef.current, tags)
        if(anyChange) {
            badgeRowsRef.current = newRows
            setBadgeRows(newRows)
        }
    }, [tags, updateBadgeRowsFromTags])

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
        // console.log('%cItem clicked/tapped:', 'color: black; background-color: yellow;', id, projectIndex, window.location.search, isMouse);
        
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

                if(((selfRect.bottom - containerRect.top >= MIN_Y_VISIBLE) && ((containerRect.bottom - selfRect.bottom >= ALLOWABLE_MISSED_Y) && (containerRect.bottom - selfRect.top >= MIN_Y_VISIBLE)))
                    && ((selfRect.right - containerRect.left >= MIN_X_VISIBLE) && ((containerRect.right - selfRect.right >= ALLOWABLE_MISSED_X) && (containerRect.right - selfRect.left >= MIN_X_VISIBLE)))
                ) return;

                selfRef.current?.scrollIntoView({behavior: jump ? "instant" : (jump === false ? "smooth" : "auto")});
                // // selfRef.current?.scrollTo()
            });
        },
        onClick }), [onClick, scrollContainer, expanded, extraRef]);



    const deferredExpanded = React.useDeferredValue(expanded);
    const expanded_ = React.useMemo(()=>carouselOpen ? deferredExpanded : expanded, [carouselOpen, deferredExpanded, expanded]);

    const shouldExpand = React.useRef<boolean>(false);

    const onHover: PointerEventHandler<HTMLDivElement> = useCallback((evt) => {
        // console.log(`PROJECT ITEM '${id}' HOVERED`, {carouselOpen, lightboxOpen, lightboxData});
        if(carouselOpen || lightboxOpen) return;
        const pointerType = evt.pointerType;
        const isMouse = pointerType === 'mouse';
        if(!isMouse) return;
        shouldExpand.current = true;
        // startTransition(()=>{if(shouldExpand.current) clickItem(id, projectIndex, 'active')});
        clickItem(id, projectIndex, 'active')
    }, [clickItem, carouselOpen, lightboxOpen, projectIndex, id]);

    const onUnhover: PointerEventHandler<HTMLDivElement> =  useCallback((evt) => {
        // console.log(`PROJECT ITEM '${id}' UNHOVERED`, {carouselOpen, lightboxOpen});
         if(carouselOpen || lightboxOpen) return;
        const pointerType = evt.pointerType;
        const isMouse = pointerType === 'mouse';
        if(!isMouse) return;
        shouldExpand.current = false;
        // startTransition(()=>{if(!shouldExpand.current) clearActiveItem()});
        clearActiveItem()
    }, [clearActiveItem, carouselOpen, lightboxOpen]);


    const handleThumbClick = useCallback((evt: MouseEvent<HTMLImageElement | HTMLDivElement>, index: number) => {
        // console.log('THUMB CLICK', lightboxData, index);
        // console.log(`PROJECT ITEM '${id}' THUMB #${index + 1} CLICKED`);
        if(!lightboxData?.sources?.length) return;
        evt.preventDefault();
        evt.stopPropagation();
        lightboxDispatch({type: 'SET_PROJECT', projectId: id, projectIndex});
        lightboxDispatch({type: 'SET_CONTENT', sourceKey: id, ...lightboxData});
        lightboxDispatch({type: 'OPEN', slide: index + 1, enableOpenDetails: !carouselOpen});
    }, [lightboxDispatch, lightboxData, id, projectIndex, carouselOpen]);

    const setSizeChanging_ = React.useCallback((changing: boolean)=>setSizeChanging(projectIndex, changing), [setSizeChanging, projectIndex]);

    return (
        <Card 
            ref={selfRef}
            onClick={onClick}
            onPointerEnter={onHover}
            onPointerLeave={onUnhover}
            className={`
                project-item-card
                h-min
                relative cursor-pointer overflow-hidden transition-all
                [text-wrap-mode:wrap] [text-wrap:stable]
                hover:shadow-lg
                ${expanded ? "ring-2 ring-primary" : ""}
                ${isPending ? "outline-4 outline-yellow-500" : ""}
            `}
        >
            {/* Header */}
            <CardHeader className="pb-2 project-item-header">
                <CardTitle className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold project-title">{title}</span>
                    <span className="text-sm text-muted-foreground project-date">{dateText}</span>
                </CardTitle>

                {/* Description */}
                <p className="text-sm text-muted-foreground project-item-description">{description}</p>

                {/* Category */}
                <div className="absolute w-full inset-0 flex justify-center h-min rounded-t-xl text-sm select-none pointer-events-none text-gray-900 dark:text-gray-400 project-item-category">
                    {project.category.toUpperCase()}
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className='space-y-2 project-item-content'>

                {/* Category-based tags */}
                <BadgeRows badgeRows={badgeRows} />

                {/* Expanded content */}
                {summary && (
                    // <Suspense fallback={fallback}>
                        <ExpandedPart id={id} expanded={expanded_} ref={extraRef} setSizeChanging={setSizeChanging_}>
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