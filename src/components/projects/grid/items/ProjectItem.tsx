import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type Dispatch, type ReactElement, type RefAttributes, type SetStateAction } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectInfo } from "../../types";
import { BadgeRows } from "./badges/BadgeRows";
import { convertToBadgeType, type BadgeType } from "./badges/badgeTypes";
import ExpandedPart from "./expansion/ExpandedPart";
import {gsap} from "gsap";
import {ImageRow} from './expansion/ImageRow';

import type {EmblaCarouselType, EmblaEventType, EmblaOptionsType} from "embla-carousel";



export interface ProjectItemHandle {
    // setExpanded: (value: boolean) => void;
    // toggleExpanded: () => void;
    // isExpanded: () => boolean;

    onClick: () => void;

};

type ProjectItemProps = {
    project: ProjectInfo,
    activeProjectIndex: number | null,

    openedProjectId: string | null;
    setOpenedProjectId: Dispatch<SetStateAction<string | null>>;
    // onProjectOpen: Dispatch<SetStateAction<ProjectItemInfo | null>> | ((info: ProjectItemInfo | null) => void),
    activeProjectId: string | undefined,
    // onProjectHover: Dispatch<SetStateAction<ProjectItemInfo | null>>,
      setActiveProjectItem:  ((item: string | ProjectInfo | null) => void), // Dispatch<SetStateAction<ProjectItemInfo | null>> |
      // setHoveredProjectItem: Dispatch<SetStateAction<ProjectItemInfo | null>>,
    
      carouselOpen: boolean,
    
      setCarouselOpen: Dispatch<SetStateAction<boolean>>,

      activeProject: ProjectInfo | null,

      // onClick: () => void;
};

export type ProjectItemElement = ReactElement<ProjectItemProps & RefAttributes<ProjectItemHandle>>;
export type ProjectItemInfo = {
    elem: HTMLDivElement,
    data: ProjectInfo
};

const ProjectItem = forwardRef<ProjectItemHandle, ProjectItemProps>(({ openedProjectId, setOpenedProjectId, activeProject, activeProjectIndex, activeProjectId, setActiveProjectItem, project, carouselOpen, setCarouselOpen }: ProjectItemProps, ref) => {
    // console.log('projectInfo:', project);
  const { id, images, title, date, summary, description, tags, contentHtml } = project;
  // const [expanded, setExpanded] = useState(false);


  const year = useMemo(()=>(date.explicitDate?.year ?? date.getFullYear()), [date]);
  const selfRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);

  const newEntries = useMemo(() => Object.entries(tags || {}).map(([k, vs]) => {
    const newKey = convertToBadgeType(k);
    return [newKey, vs];
  }), [tags]);
  const badgeRows = useMemo(()=>(newEntries.length > 0 ? Object.fromEntries(newEntries) : {}) as Record<BadgeType, Set<string>>, [newEntries]);

  const expanded = useMemo(() => {
    // console.log(id, activeProjectId, id == activeProjectId);
    return (id == activeProjectId);
  }, [id, activeProjectId]);
  
  const onClick = useCallback(() => {
      // console.log('ONCLICK -- id:', id, activeProject, activeProjectIndex, openedProjectId);
      // console.log('onClick expanded:', expanded);
      if(id === activeProjectId) {
        // // if(carouselOpen) return;
        // console.log('Setting carouselOpen');
        // // setOpened(true);
        // console.log(`Setting activeProjectId to ${id} -- prev:`, activeProjectId);
        // setActiveProjectItem(id);
        console.log('Setting opened project id:', id);
        setOpenedProjectId(id);
        console.log('Setting carousel open');
        // // if(!carouselOpen) 
        setCarouselOpen(true);
      } else {
        // // console.log('Setted activeProjectId to:', activeProjectId)
        // // setCarouselOpen(false);
        console.log(`Setting activeProjectId to ${id} -- prev:`, activeProjectId);
        setActiveProjectItem(id);
      }
    }, [id, activeProjectId, setCarouselOpen, setActiveProjectItem]);

  useImperativeHandle(ref, () => ({onClick}), [id, activeProjectId]);  // [activeProject, activeProjectId, setActiveProjectItem, setCarouselOpen]);

  useEffect(() => {
      const el = extraRef.current;
      if (!el) return;

    //   console.log('EL:', el, el.clientHeight, el.offsetHeight, el.scrollHeight, el.style.height, el.style.maxHeight, el.style.minHeight)

      if (expanded) {
        // Expand: animate from current height 0 to scrollHeight
        gsap.killTweensOf(el);
        gsap.fromTo(
          el,
          { height: 0, opacity: 0 },
          {
            height: el.scrollHeight,
            opacity: 1,
            duration: 0.3,
            ease: "power1.out",
            onComplete: () => { 
                gsap.set(el, { height: "auto" });
                // console.log('el after expand:', el)
            },
          }
        );
      } else if (el.clientHeight !== 0) {  // if(el.style.height == 'auto') {
        // Collapse: animate from current numeric height to 0
        gsap.killTweensOf(el);
        const currentHeight = el.clientHeight;
        gsap.fromTo(
          el,
          { height: currentHeight, opacity: 1 },
          { height: 0, opacity: 0, duration: 0.3, ease: "power1.in",
            // onComplete: () => {
            //     console.log('el after collapse:', el)
            // }
           }
        );
      }
    }, [id, expanded]);


  return (
    <Card ref={selfRef}
      onClick={() => onClick()}
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
      <CardContent
        className='space-y-2'
      >
        {/* Description */}
        <p className="text-sm text-muted-foreground">{description}</p>

        {/* Category-based tags */}
        <BadgeRows badgeRows={badgeRows}></BadgeRows>

        {/* Expanded content */}
        {
            summary && (
                <ExpandedPart ref={extraRef}>
                    {summary}
                    {images && images.length > 0 && (<ImageRow images={images}></ImageRow>)}
                </ExpandedPart>
            )
        }
      </CardContent>
    </Card>
  );
});

export default ProjectItem;