// import { useMemo } from "react";
// // import { useWindowSize } from "react-use";
// import { useWindowSize } from "@/hooks/useWindowSize";
// import ProjectGrid from "./ProjectGrid";
// import type { ProjectData } from "./types";

// export default function ResponsiveProjectGrid({ projects }: { projects: ProjectData[] }) {
//   const { width } = useWindowSize();

//   const columns = useMemo(() => {
//     if (width < 640) return 1;
//     if (width < 1024) return 2;
//     if (width < 1400) return 3;
//     return 4;
//   }, [width]);

//   return <ProjectGrid projects={projects} columns={columns} />;
// }