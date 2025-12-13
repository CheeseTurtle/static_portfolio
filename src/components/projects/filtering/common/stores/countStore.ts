import type { ProjectInfo, TagKey } from "@/components/projects/types";
import {createStore} from "zustand";
import { applyFilter, type FilterDataProps, type TagFilterMode } from "./filterStore";
import { subscribeWithSelector } from "zustand/middleware";
import type { BrowserStore } from "./browserStore";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { getTagTypeFromTagKey, type TagType } from "../filterTypes";
import type { MemberOf } from "@/lib/type-utils";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";



type CountStoreData = {
    tagCounts: Record<TagKey, {[key: string]: number}>,
    categoryCounts: {[key: string]: number},
}
interface CountStoreProps {
    initial: CountStoreData,
    current: CountStoreData
}

interface CountStoreActions {
    computeTagOrders: typeof computeTagOrders,
    updateCounts: (projects: ProjectInfo[], spec?: Partial<FilterDataProps>, tagModes?: Record<TagType, TagFilterMode>) => void, // or bool?
    _updateCounts: (projects: ProjectInfo[], tagModes: Record<TagType, TagFilterMode>, spec?: Partial<FilterDataProps>) => void, // or bool?
}

export interface CountStoreState extends CountStoreProps, CountStoreActions {
    
}


export type CountStoreInitProps = {
    allProjects: ProjectInfo[],
    browserStore: BrowserStore,
};

// // function getTagCounts<K extends TagKey>(projects: ProjectInfo[], keys: K): {[tag: string]: number};
// // function getTagCounts<K extends TagKey>(projects: ProjectInfo[], keys: K[]): Record<K, {[tag: string]: number}>;
// function getTagCounts<K extends TagKey>(projects: ProjectInfo[], keys: K[]): Record<K, {[tag: string]: number}> { // | {[tag: string]: number} {
//     // if(typeof keys !== 'string') {
//     //     return Object.fromEntries(keys.map(tagKey=>[tagKey as K, getTagCounts(projects, tagKey)]) as ([K, {[_: string]: number}][]));
//     // }

//     const ret: Partial<Pick<Record<TagKey, {[tag: string]: number}>, K>> = {};
//     keys.forEach((key)=>{
//         ret[key] = {};
//     });

//     projects.forEach(p=>{
//         keys.forEach(k=>{
//             const retk = ret[k]!;
//             if(!p.tags[k]?.size) return;
//             p.tags[k].forEach(t=>{
//                 retk[t] = (retk[t] ?? 0) + 1;
//             })
//         });
//     });

//     return ret as Pick<Record<TagKey, {[tag: string]: number}>, K>;
// }

// function getCategoryCounts(projects: ProjectInfo[]): {[cat: string]: number} {
//     const categoryCounts: {[key: string]: number} = {};    
//     projects.forEach(p=>{
//         categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
//     })
//     return categoryCounts;
// }




/**
 * Compute counts to display on category/tag filter toggle buttons.
 *
 * For each CATEGORY, the count is equal to the number of projects (from all projects) of that category that match the current YEAR+TAG filters.
 * 
 * For a TAG whose tag-type has its mode set to AND, the count is equal to the number of the currently visible projects
 * (i.e. projects matching the current YEAR+CATEGORY+TAG filters) whose tags (assumably of the tag's tag-type) include the tag.
 * 
 * For a TAG whose tag-type has its mode set to OR, the count is equal to the number of projects (from all projects)
 * that:
 *      1. match the current YEAR+CATEGORY filters,
 *      2. match the tag filters for other tag-types, and
 *      3. whose tags (of this tag-type) include this tag.
 * 
 * A non-zero count indicates that selecting the tag (when it's unselected) and adding it to the filter specification would not result in zero visible/filter-matching projects.
 * This is used to enable/disable the buttons to prevent users from accidentally creating "dead-end" filter combinations.
 * It is also used for sorting (i.e. dead-end buttons are moved to the end).
 * 
 * @param {ProjectInfo[]} projects                          The currently-visible projects (i.e. projects from allProjects that match the full set of current filters)
 * @param {?Record<TagType, TagFilterMode>} [tagModes]      The filter mode (AND or OR) to apply for each tag-type. If not given, they are taken from `spec`.
 * @param {?ProjectInfo[]} [allProjects]                    All projects (used for computing category and OR-mode counts).
 * @param {?Partial<FilterDataProps>} [spec]                Specification of year, category, and/or tag filters (possibly empty). When the `tagModes` argument is not provided, `spec` must contain `tagModes`.
 * @returns {CountStoreData}                                The counts for each category and tag.
 */
function getCounts(projects: ProjectInfo[], tagModes?: Record<TagType, TagFilterMode>, allProjects?: ProjectInfo[], spec?: Partial<FilterDataProps>): CountStoreData {
    // Initialize empty results to populate
    const tagCounts: Record<TagKey, {[key: string]: number}> = {
        languages: {}, skills: {}, topics: {}
    };
    const categoryCounts: {[key: string]: number} = {};

    // Compute counts
    if(!spec) { // No spec or tagModes provided --assume we are initializing (no filtering).
        for(const p of projects) {
            categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
            Object.entries(p.tags).forEach(([tagKey, tags])=>{
                const counts = tagCounts[tagKey as TagKey];
                tags.forEach(tag=>{
                    counts[tag] = (counts[tag] ?? 0) + 1;
                });
            });
        }
    } else if((tagModes = tagModes ?? spec.tagModes)){
        // If allProjects is not given separately, assume that the `projects` argument IS allProjects.
        allProjects ??= projects;
        // tagModes ??= spec.tagModes;

        // Apply year filter to projects
        const withYear = (spec.year && (spec.year[0] || spec.year[1])) ? applyFilter({year: spec.year}, allProjects) : allProjects;
        
        // If any of the tag types have selected tags, then apply that filter on top of the year filter.
        // Use the result to compute how many projects each category button would contribute if selected.
        const forCatCounts = (spec.tags && Object.values(spec.tags).some(x=>x.size)) ? applyFilter({tags: spec.tags, tagModes}, withYear) : withYear;
        forCatCounts.forEach(p=>{
            categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
        });

        // If any of the tag modes are OR (rather than AND), we have to apply the tag categories separately to obtain tag counts.
        if(Object.values(tagModes).some(x=>x)) {
            // Apply category filter on top of year filter.
            const forTagCounts = spec.categories?.size ? applyFilter({categories: spec.categories}, withYear) : withYear;
            // For each category, 
            Object.entries(tagCounts).forEach(([tagKey, counts])=>{
                const tagType = getTagTypeFromTagKey(tagKey as TagKey);
                const tagMode = tagModes![tagType];
                const forTagCounts_ = (()=>{
                    if(tagMode) { // OR (match any)
                        // Isolate the tag types that are NOT the current tag type, if there are any with selected tags
                        const filterKeys = (spec.tags ? Object.keys(spec.tags).filter(x=>x!==tagType) as TagType[] : undefined);

                        // Use the resulting keys, if there are any, to collect the tag types with at least one selected tag.
                        const filterTags = filterKeys?.length ? {[tagType]: new Set<string>(), ...Object.fromEntries(filterKeys.map(k=>[k, spec.tags![k]])) as Partial<Record<TagType, Set<string>>>} as Record<TagType, Set<string>>: undefined;

                        // If the result is not undefined, apply those tag types' filters (on top of the year+category filters) and use the result to get the counts for this tag type's tags.
                        return filterTags ? applyFilter({tagModes: tagModes!, tags: filterTags}, forTagCounts) : forTagCounts;
                    } else { // AND (match all)
                        return projects;  // Just use current visibleProjects (which has all year+category+tag filterw applied).
                    }
                })();

                // Iterate over the resulting array of projects and accumulate counts for the tags of this type.
                forTagCounts_.forEach(p=>{
                    const pTags = p.tags[tagKey as TagKey];
                    pTags?.forEach(tag=>{
                        counts[tag] = (counts[tag] ?? 0) + 1;
                    });
                });
            });
        } else {
            // Otherwise (all are AND), apply all tags simultaneously (in combination with current year and category filters).
            const forTagCounts = projects;  // ((spec.tags && Object.values(spec.tags).some(x=>x.size)) || spec.categories?.size) ? applyFilter({categories: spec.categories, tags: spec.tags, tagModes}, withYear) : withYear;
            forTagCounts.forEach(p=>{
                Object.entries(p.tags).forEach(([tagKey, tags])=>{
                    const counts = tagCounts[tagKey as TagKey];
                    tags.forEach(tag=>{
                        counts[tag] = (counts[tag] ?? 0) + 1;
                    });
                });
            });
        }
    } else {
        throw new TypeError("No tagModes were given, and the given spec did not contain tagModes");
    }
    return {tagCounts, categoryCounts};
}



// function getCounts(
//   projects: ProjectInfo[], 
//   tagModes?: Record<TagType, TagFilterMode>, 
//   allProjects?: ProjectInfo[], 
//   spec?: Partial<FilterDataProps>
// ): CountStoreData {
//   const tagCounts: Record<TagKey, Record<string, number>> = {
//     languages: {}, 
//     skills: {}, 
//     topics: {}
//   };
//   const categoryCounts: Record<string, number> = {};

//   // Simple case: no spec or tagModes - just count everything
//   if (!spec || !tagModes) {
//     for (const p of projects) {
//       categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
      
//       // Cache tagCounts access
//       const languages = tagCounts.languages;
//       const skills = tagCounts.skills;
//       const topics = tagCounts.topics;
      
//       for (const tag of p.tags.languages) languages[tag] = (languages[tag] ?? 0) + 1;
//       for (const tag of p.tags.skills) skills[tag] = (skills[tag] ?? 0) + 1;
//       for (const tag of p.tags.topics) topics[tag] = (topics[tag] ?? 0) + 1;
//     }
//     return { tagCounts, categoryCounts };
//   }

//   // Complex case: apply filters
//   const base = allProjects ?? projects;
  
//   // Apply year filter once if needed
//   const hasYearFilter = spec.year && (spec.year[0] || spec.year[1]);
//   const afterYear = hasYearFilter ? applyFilter({ year: spec.year }, base) : base;
  
//   // Get projects for category counts
//   const hasTagFilters = spec.tags && Object.values(spec.tags).some(x => x.size);
//   const forCatCounts = hasTagFilters 
//     ? applyFilter({ tags: spec.tags, tagModes }, afterYear) 
//     : afterYear;
  
//   // Count categories
//   for (const p of forCatCounts) {
//     categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
//   }

//   // Count tags
//   const anyOrMode = Object.values(tagModes).some(x => x);
  
//   if (anyOrMode) {
//     // Apply category filter once
//     const afterCategory = spec.categories?.size 
//       ? applyFilter({ categories: spec.categories }, afterYear) 
//       : afterYear;
    
//     // Count each tag type separately based on its mode
//     for (const [tagKey, counts] of Object.entries(tagCounts)) {
//       const tagType = getTagTypeFromTagKey(tagKey as TagKey);
//       const isOrMode = tagModes[tagType];
      
//       const relevantProjects = isOrMode
//         ? getProjectsForOrModeTag(tagType, spec, tagModes, afterCategory)
//         : projects;
      
//       countTagsForProjects(relevantProjects, tagKey as TagKey, counts);
//     }
//   } else {
//     // All AND mode - filter once and count all
//     const hasCategoryFilter = spec.categories?.size;
//     const forTagCounts = (hasTagFilters || hasCategoryFilter)
//       ? applyFilter({ categories: spec.categories, tags: spec.tags, tagModes }, afterYear)
//       : afterYear;
    
//     for (const p of forTagCounts) {
//       const languages = tagCounts.languages;
//       const skills = tagCounts.skills;
//       const topics = tagCounts.topics;
      
//       for (const tag of p.tags.languages) languages[tag] = (languages[tag] ?? 0) + 1;
//       for (const tag of p.tags.skills) skills[tag] = (skills[tag] ?? 0) + 1;
//       for (const tag of p.tags.topics) topics[tag] = (topics[tag] ?? 0) + 1;
//     }
//   }

//   return { tagCounts, categoryCounts };
// }

// // Helper: Get projects for counting tags in OR mode
// function getProjectsForOrModeTag(
//   tagType: TagType,
//   spec: Partial<FilterDataProps>,
//   tagModes: Record<TagType, TagFilterMode>,
//   baseProjects: ProjectInfo[]
// ): ProjectInfo[] {
//   if (!spec.tags) return baseProjects;
  
//   const otherTagTypes = Object.keys(spec.tags).filter(x => x !== tagType) as TagType[];
//   if (!otherTagTypes.length) return baseProjects;
  
//   // Build filter excluding current tag type
//   const filterTags: Record<TagType, Set<string>> = {
//     [tagType]: new Set<string>()
//   } as unknown as Record<TagType, Set<string>>;
  
//   for (const key of otherTagTypes) {
//     filterTags[key] = spec.tags[key]!;
//   }
  
//   return applyFilter({ tagModes, tags: filterTags }, baseProjects);
// }

// // Helper: Count tags for a set of projects
// function countTagsForProjects(
//   projects: ProjectInfo[], 
//   tagKey: TagKey, 
//   counts: Record<string, number>
// ): void {
//   for (const p of projects) {
//     for (const tag of p.tags[tagKey]) {
//       counts[tag] = (counts[tag] ?? 0) + 1;
//     }
//   }
// }

// function computeDataOrder(data: CountStoreData) {
// }


function computeTagOrders<Tag extends string, TagsToSort extends Tag[] = any>(tags: TagsToSort, tagCounts: Partial<Record<Tag, number>>, inPlace?: boolean, selected?: Set<Tag> | null, ):
// function computeTagOrders<Tag extends string, TagsToSort extends Tag[] = any, CountedTag extends Tag = any>(tags: TagsToSort, tagCounts: Record<CountedTag, number>, inPlace?: boolean):
    [Record<MemberOf<TagsToSort>, number>, Tag[]]
{
    const tags_ = inPlace ? tags : Array.from(tags);  // vs [...tags]??
    const sorted = tags_.sort((a,b) => {
        if(selected) {
            const selA = selected.has(a);
            const selB = selected.has(b);
            if(selA) {
                if(!selB) return -1;
            } else if(selB) {
                return 1;
            }
        }
        return (tagCounts[b] ?? 0) - (tagCounts[a] ?? 0);
    });

    return [Object.fromEntries(sorted.map((v,i)=>[v,i])) as Record<MemberOf<TagsToSort>, number>, sorted];
}

export const createCountStore = ({allProjects, browserStore}: CountStoreInitProps) => {
    const filterStore = useStoreWithEqualityFn(browserStore, s=>s.filterStore); // TODO: Equality fn?

    const initialCounts = getCounts(allProjects);

    const countStore = createStore<CountStoreState>()(subscribeWithSelector((set,get)=>{
         // TODO: Equality functions

        // const setCurrent = (counts: CountStoreData) => set({current: counts});

        // filterStore.subscribe(s=>s.tagModes, (tagModes) => {
        //     if(Object.values(tagModes).some(x=>x)) {


        //     }
        // });

        // browserStore.subscribe(s=>s.visibleProjects, (projects, prevProjects) => {
        //     // setCurrent(getCounts(projects));
        //     get().updateCounts(projects);
        // }, {});

        // const debouncedUpdate = useDebounceCallback((spec: FilterDataProps)=>{
        //     get().updateCounts(browserStore.getState().visibleProjects, spec);
        // }, 50);

        filterStore.subscribe(s=>({year: s.year, categories: s.categories, tags: s.tags, tagModes: s.tagModes} as FilterDataProps), (spec, _prevSpec) => {
            // debouncedUpdate(spec);
            get().updateCounts(browserStore.getState().visibleProjects, spec);
        }, {});


    
        // filterStore.subscribe(s=>s.tags, (state, prevState) => {
        //     const categoryCounts = get().current.categoryCounts;
        //     setCurrent({
        //         categoryCounts,
        //         tagCounts: getTagCounts(projects, keys)
        //     })
        // }, {});
    
    
        // filterStore.subscribe(s=>s.year, (state, prevState)=>{
    
    
        // }, {});
    
        // filterStore.subscribe(s=>s.categories, (state, prevState) => {
    
    
        // });
        return {
            initial: initialCounts,
            current: initialCounts,
            computeTagOrders,
            _updateCounts(projects, tagModes, spec) {
                console.log('Updating counts');
                const newCounts = getCounts(projects, tagModes, allProjects, spec);
                // console.log('Old counts:', get().current);
                // console.log('New counts:', newCounts);
                set({current: newCounts}); // TODO: Check if changed before setting
                // return newCounts;
            },
            updateCounts(projects, spec?: Partial<FilterDataProps>, tagModes?: Record<TagType, TagFilterMode>) {
                spec ??= filterStore.getState();
                tagModes ??= spec?.tagModes ?? filterStore.getState().tagModes;
                return get()._updateCounts(projects, tagModes, spec);
            },
        };
    }));


    return countStore;
}


export type CountStore = ReturnType<typeof createCountStore>;
