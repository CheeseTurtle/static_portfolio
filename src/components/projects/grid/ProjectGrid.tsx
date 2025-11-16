// src/components/ProjectGrid.tsx
import { useMemo, type Dispatch, type SetStateAction } from "react";
import ProjectItem, { type ProjectItemInfo } from "./items/ProjectItem";
import type { ProjectInfo } from "./../types";
import { useWindowSize } from "../../../hooks/useWindowSize";

interface ProjectGridProps {
  projects: ProjectInfo[];
  activeProjectId: string | undefined;

  activeProject: ProjectInfo | null;

  activeProjectIndex: number | null;
    openedProjectId: string | null;
    setOpenedProjectId: Dispatch<SetStateAction<string | null>>;

  setActiveProjectItem:  ((item: string | ProjectInfo | null) => void); // Dispatch<SetStateAction<ProjectItemInfo | null>> |
  // setHoveredProjectItem: Dispatch<SetStateAction<ProjectItemInfo | null>>,
  
  carouselOpen: boolean;

  setCarouselOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ProjectGrid({ activeProject, projects, activeProjectId, activeProjectIndex, openedProjectId, setOpenedProjectId, setActiveProjectItem, carouselOpen, setCarouselOpen }: ProjectGridProps) {
  const { width } = useWindowSize();

  // const activeProjectId_ = useMemo(() => activeProjectId, [activeProjectId]);
  // const carouselOpen_ = useMemo(() => carouselOpen, [carouselOpen]);

  // Determine number of columns based on viewport width
  const columns = useMemo(() => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1400) return 3;
    return 4;
  }, [width]);

  // Split projects row-wise into columns
  const cols: ProjectInfo[][] = useMemo(() => {
    const arr: ProjectInfo[][] = Array.from({ length: columns }, () => []);
    projects.forEach((p, i) => {
      arr[i % columns].push(p);
    });
    return arr;
  }, [projects, columns]);

  return (
    <div className="flex w-full gap-4">
      {cols.map((col, i) => (
        <div key={i} className="flex-1 flex flex-col gap-4">
          {col.map((p) => (
            <ProjectItem key={p.id} openedProjectId={openedProjectId} setOpenedProjectId={setOpenedProjectId} activeProject={activeProject} activeProjectIndex={activeProjectIndex} project={p} activeProjectId={activeProjectId} setActiveProjectItem={setActiveProjectItem} carouselOpen={carouselOpen} setCarouselOpen={setCarouselOpen} />
          ))}
        </div>
      ))}
    </div>
  );
}



// Row-wise order: arr[i % columns].push(p) ensures items fill columns left-to-right.

// Independent column reflow: Expanding a ProjectItem only pushes items in its column down.

// Responsive columns: Uses width to automatically adjust column count.

// Even spacing: flex-1 and gap-4 make columns equal width and add spacing between items.