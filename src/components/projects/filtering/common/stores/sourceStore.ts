// import { create } from "zustand";
// import { createComputed } from "zustand-computed";
// import { useFilterStore } from "./FilterStore"; // your store
// import type { ProjectInfo } from "@/components/projects/types";

// type BrowserDataStateBase = {
//   fixed: { allProjects: ProjectInfo[] };
//   activeProjectIndex: number | null;
//   setActiveProjectIndex: (i: number | null) => void;
// };

// type BrowserDataComputed = {
//   activeProjectId: string | undefined;
//   visibleProjects: ProjectInfo[];
// };

// export type BrowserDataState = BrowserDataStateBase & BrowserDataComputed;

// export const useBrowserDataStore = create<BrowserDataStateBase>()(
//   createComputed<BrowserDataStateBase>((state) => {
//     // Access the current filter state
//     const { categories, year, tags } = useFilterStore.getState();

//     // Filter projects based on FilterStore
//     const visibleProjects = state.fixed.allProjects.filter((p) => {
//       // Example: filter by category
//       if (categories.size && !categories.has(p.category)) return false;

//       // Example: filter by year range
//       if (year) {
//         const [min, max] = year;
//         if ((min !== undefined && p.year < min) || (max !== undefined && p.year > max)) return false;
//       }

//       // Example: filter by tags (simplified)
//       for (const tagType of Object.keys(tags) as Array<keyof typeof tags>) {
//         const selectedTags = tags[tagType];
//         if (selectedTags.size && !p[tagType].some((t: string) => selectedTags.has(t))) {
//           return false;
//         }
//       }

//       return true;
//     });

//     return {
//       visibleProjects,
//       activeProjectId:
//         state.activeProjectIndex != null
//           ? visibleProjects[state.activeProjectIndex]?.id
//           : undefined,
//     };
//   })((set) => ({
//     fixed: { allProjects: [] }, // replace with actual projects
//     activeProjectIndex: null,
//     setActiveProjectIndex: (i: number | null) => set({ activeProjectIndex: i }),
//   }))
// );