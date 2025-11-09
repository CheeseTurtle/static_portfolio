import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type Dispatch, type ReactElement, type RefAttributes, type SetStateAction } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectData } from "../../types";
import { BadgeRows } from "./badges/BadgeRows";
import { convertToBadgeType, type BadgeType } from "./badges/badgeTypes";
import ExpandedPart from "./expansion/ExpandedPart";
import {gsap} from "gsap";
import {ImageRow} from './expansion/ImageRow';


export interface ProjectItemHandle {
    // setExpanded: (value: boolean) => void;
    // toggleExpanded: () => void;
    // isExpanded: () => boolean;

    onClick: () => void;

};

type ProjectItemProps = {
    project: ProjectData,
    activeProjectIndex: number | null,

    openedProjectId: string | null;
    setOpenedProjectId: Dispatch<SetStateAction<string | null>>;
    // onProjectOpen: Dispatch<SetStateAction<ProjectItemInfo | null>> | ((info: ProjectItemInfo | null) => void),
    activeProjectId: string | undefined,
    // onProjectHover: Dispatch<SetStateAction<ProjectItemInfo | null>>,
      setActiveProjectItem:  ((item: string | ProjectData | null) => void), // Dispatch<SetStateAction<ProjectItemInfo | null>> |
      // setHoveredProjectItem: Dispatch<SetStateAction<ProjectItemInfo | null>>,
    
      carouselOpen: boolean,
    
      setCarouselOpen: Dispatch<SetStateAction<boolean>>,

      activeProject: ProjectData | null,

      // onClick: () => void;
};

export type ProjectItemElement = ReactElement<ProjectItemProps & RefAttributes<ProjectItemHandle>>;
export type ProjectItemInfo = {
    elem: HTMLDivElement,
    data: ProjectData
};

const ProjectItem = forwardRef<ProjectItemHandle, ProjectItemProps>(({ openedProjectId, setOpenedProjectId, activeProject, activeProjectIndex, activeProjectId, setActiveProjectItem, project, carouselOpen, setCarouselOpen }: ProjectItemProps, ref) => {
    // console.log('projectData:', project);
  const { id, images, title, year, summary, description, tags, contentHtml } = project;
  // const [expanded, setExpanded] = useState(false);

  const selfRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);

  const newEntries = Object.entries(tags || {}).map(([k, vs]) => {
    const newKey = convertToBadgeType(k);
    return [newKey, vs];
  });
  const badgeRows = (newEntries.length > 0 ? Object.fromEntries(newEntries) : {}) as Record<BadgeType, string[]>;

  // const [opened, setOpened] = useState<boolean>(false);

  
  
  const expanded = useMemo(() => {
    // console.log(id, activeProjectId, id == activeProjectId);
    return (id == activeProjectId);
  }, [id, activeProjectId, activeProject, activeProjectIndex, openedProjectId]);
  
  // const expanded = useCallback(() => {
    //     console.log('Evaluating `expanded`:', id, activeProjectId, id == activeProjectId, id === activeProjectId);
    //     return id == activeProjectId
    //   }, [activeProjectId]);
    
    // const expanded = id == activeProjectId;
    
    // const expandedAndOpened = useCallback(() => (openedProjectId == id) && expanded, [carouselOpen, expanded]);

  const onClick = useCallback(() => {
      // // const self = handleRef.current;
      // // if(!self) return;
      // console.log('ONCLICK -- id:', id, activeProject, activeProjectIndex, openedProjectId);
      // console.log('onClick expanded:', expanded);
      if(id == activeProjectId) {
        // // if(carouselOpen) return;
        // console.log('Setting carouselOpen');
        // // setOpened(true);
        // // if(!carouselOpen) 
        // console.log(`Setting activeProjectId to ${id} -- prev:`, activeProjectId);
        setActiveProjectItem(id);
        setOpenedProjectId(id);
        setCarouselOpen(true);
      } else {
        // // console.log('Setted activeProjectId to:', activeProjectId)
        // // setCarouselOpen(false);
        // console.log(`Setting activeProjectId to ${id} -- prev:`, activeProjectId);
        setActiveProjectItem(id);
      }
    }, [id, activeProjectId]);

  // const handleRef = useRef<ProjectItemHandle>({
  //   // setExpanded: (value: boolean) => {
  //   //   if(value) {
  //   //     if(!expanded()) setActiveProjectItem(id);
  //   //   } else if(expanded()) {
  //   //     setActiveProjectItem(null);
  //   //   }
  //   // },
  //   // toggleExpanded: () => {
  //   //     // setExpanded(prev => !prev);
  //   //     setActiveProjectItem(expanded() ? null : id);
  //   // },
  //   // isExpanded: () => expanded(),

  //   onClick,
  // });
  useImperativeHandle(ref, () => ({onClick}), [project, id]);  // [activeProject, activeProjectId, setActiveProjectItem, setCarouselOpen]);

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


    // function onClick(value: boolean) {
    //     // const v = ref;
    //     const el = selfRef.current;
    //     if(!el) return;
    //     if(value) {
    //         const info: ProjectItemInfo = {
    //             data: project,
    //             elem: el,
    //         }
    //         if(expanded) {
    //             onProjectOpen(info);
    //         } else {
    //             // setExpanded(value);
    //             onProjectHover(info);
    //         }
    //     } else {
    //         setExpanded(value);
    //     }
    // }


//   useEffect(() => {
//     if(!extraRef.current) return;
//     if(expanded) {
//         gsap.to(extraRef.current, {height: 'auto', opacity: 1, duration: 0.3});
//     } else {
//         gsap.to(extraRef.current, {height: 0, opacity: 0, duration: 0.3});
//     }
//   }, [expanded]);

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
        // className={`
        //   transition-all duration-300 ease-in-out
        //   ${expanded ? "max-h-[1000px]" : "max-h-32"}
        //   space-y-2
        // `}
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
        {/* {expanded && contentHtml && (
          <div
            className="text-sm text-foreground/80 pt-2 border-t border-border"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )} */}
      </CardContent>
    </Card>
  );
});

export default ProjectItem;