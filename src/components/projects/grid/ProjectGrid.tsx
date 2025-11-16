// src/components/ProjectGrid.tsx
import { memo, useMemo } from "react";
import ProjectItem from "./items/ProjectItem";
import type { ProjectInfo } from "./../types";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useBrowserContext } from "../filtering/common/browserContext";

interface ProjectGridProps {
  // No props needed! Everything comes from the store
}

const ProjectGrid = (({}: ProjectGridProps) => {
  const { width } = useWindowSize();

  // Get state from store
  // const projects = useBrowserContext(s => Array.from(s.visibleProjects.values()));
  const projects = useBrowserContext(s=>s.visibleProjects);
  const activeProjectId = useBrowserContext(s => s.activeProjectId);
  const activeProjectIndex = useBrowserContext(s => s.activeProjectIndex);
  const openProjectId = useBrowserContext(s => s.openProjectId);
  const carouselOpen = useBrowserContext(s => s.carouselOpen);
  
  // Get actions from store
  const clickItem = useBrowserContext(s => s.clickItem);
  const setCarouselOpen = useBrowserContext(s => s.setCarouselOpen);

  const activeProject = useMemo(
    () => activeProjectIndex !== null ? projects[activeProjectIndex] ?? null : null,
    [projects, activeProjectIndex]
  );

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
          {col.map((p, index) => {
            // Calculate the actual index in the full projects array
            const projectIndex = projects.findIndex(proj => proj.id === p.id);
            
            return (
              <ProjectItem 
                key={p.id}
                project={p}
                projectIndex={projectIndex}
                activeProject={activeProject}
                activeProjectId={activeProjectId}
                activeProjectIndex={activeProjectIndex}
                openProjectId={openProjectId}
                carouselOpen={carouselOpen}
                clickItem={clickItem}
                setCarouselOpen={setCarouselOpen}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});

export default ProjectGrid;