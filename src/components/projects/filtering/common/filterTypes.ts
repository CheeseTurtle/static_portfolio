import type React from "react";
import type { ProjectInfo, ProjectInfoWithLBSymbols, TagKey } from "../../types";

export type TagType = ('lang' | 'topic' | 'skill');  // | 'concept');
export const TAGTYPES: TagType[] = ['lang', 'skill', 'topic'];

export const TAGKEYS: TagKey[] = ['languages','skills','topics'];

export function getProjectKeyFromTagType(tt: TagType): TagKey {
    switch(tt) {
        case 'lang':
            return 'languages';
        case 'skill':
            return 'skills';
        case 'topic':
            return 'topics';
        default:
            throw TypeError();
    }
}


export function getTagTypeFromTagKey(tt: TagKey): TagType {
    switch(tt) {
        case 'languages':
            return 'lang';
        case 'skills':
            return 'skill';
        case 'topics':
            return 'topic';
        default:
            throw TypeError();
    }
}


// type YearRange = [number, number] | [undefined, number] | [number, undefined]


export type FilterState = {
  year: [number | undefined, number | undefined] | undefined; // min and max
  categories: Set<string>; // selected categories
  tags: Record<TagType, Set<string>>; // selected tags by type
  openProjectId?: string | null;
  urlProjectId?: string | null;
  _urlReplace?: boolean;
};

export enum FilterField {
    MIN_YEAR = 1,
    MAX_YEAR = 2,
    ALL_YEAR = 3,

    CATEGORY = 4,
    TAG = 8   
}

type ResetPayload = {
    mask?: FilterField,
    tagTypes?: TagType[] | TagType
}


export type InitFromURL = { category?: string[], lang?: string[], skill?: string[], topic?: string[], year?: [number | undefined, number | undefined] };

export type FilterAction =
  | { type: 'SET_YEAR'; payload: [number, number] }
  | { type: 'TOGGLE_CATEGORY'; payload: string }
  | { type: 'TOGGLE_TAG'; payload: { tagType: TagType; tagText: string } }
  | { type: 'RESET'; payload?: ResetPayload }
  //   | { type: 'OPEN_PROJECT'; payload: { id?: string | undefined, changeCarouselState?: boolean }}
  | { type: 'INIT_FROM_URL'; payload: InitFromURL & {project?: string | null} }
  | { type: 'UPDATE_URL_PROJECT', payload: {projectId?: string | null, replace?: boolean} }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  | { type: 'CLEAR_URL_PROJECT', payload?: {} }



export type FilterRangeInfo = {
    lang: Set<string>,
    topic: Set<string>,
    // concept: string[],
    skill: Set<string>,
    minYear: number,
    maxYear: number,
    categories: Set<string>,
    // audiences: string[],
    count: number, // number of project items
    categoryNames: string[],
};




export function collectFilterRangeInfo(allProjects: (ProjectInfo | ProjectInfoWithLBSymbols)[]): FilterRangeInfo {
    const langs: Set<string> = new Set(), topics: Set<string> = new Set(), /*concepts: Set<string> = new Set(),*/ skills: Set<string> = new Set();
    const categories: Set<string> = new Set();  //, audiences: Set<string> = new Set();
    let minYear: number | undefined;
    let maxYear: number | undefined;
    let count: number = 0;

    allProjects?.forEach((p) => {
        categories.add(p.category);
        // if(p.audience) audiences.add(p.audience);
        const year = p.date.getFullYear()
        if(minYear === undefined || minYear > year) minYear = year;
        if(maxYear === undefined || maxYear < year) maxYear = year;
        p.tags.languages?.forEach((x)=>langs.add(x));
        p.tags.skills?.forEach((x)=>skills.add(x));
        p.tags.topics?.forEach((x)=>topics.add(x));
        count++;
    });

    if(minYear === undefined || maxYear === undefined)
        throw Error('No projects, or no projects with years');

    return {
        lang: langs, topic: topics, skill: skills, minYear, maxYear, categories, count,
        categoryNames: Array.from(categories),
    }
}



export type FilterReducer = React.Reducer<FilterState, FilterAction>;

export function createFilterReducer(rangeInfo: FilterRangeInfo): FilterReducer {
    return function filterReducer(state: FilterState, action: FilterAction): FilterState {
        console.log('[filterReducer] Action:', action.type, action.payload);
        console.log('[filterReducer] Current state:', state);
        switch (action.type) {
            case 'SET_YEAR': {
                const minYear = (action.payload[0] > rangeInfo.minYear) ? action.payload[0] : undefined;
                const maxYear = (action.payload[1] < rangeInfo.maxYear) ? action.payload[1] : undefined;
                // console.log('payload:', action.payload, [minYear, maxYear]);
                    
                return { ...state, year: (minYear === undefined && maxYear === undefined) ? undefined : [minYear, maxYear] };
            }
            case 'TOGGLE_CATEGORY': {
                const categories = new Set(state.categories);
                if (categories.has(action.payload)) categories.delete(action.payload);
                else categories.add(action.payload);
                return { ...state, categories };
            }

            case 'TOGGLE_TAG': {
                const tags = { ...state.tags, [action.payload.tagType]: new Set(state.tags[action.payload.tagType]) };
                const tagSet = tags[action.payload.tagType];
                if (tagSet.has(action.payload.tagText)) tagSet.delete(action.payload.tagText);
                else tagSet.add(action.payload.tagText);
                return { ...state, tags };
            }

            case 'RESET': {
                if(action.payload && action.payload.mask !== undefined) {
                    const year: [number | undefined, number | undefined] | undefined = (
                        (action.payload.mask & FilterField.ALL_YEAR && state.year !== undefined)
                        ?
                        [
                            (action.payload.mask & FilterField.MIN_YEAR ? rangeInfo.minYear : state.year[0]),
                            (action.payload.mask & FilterField.MAX_YEAR ? rangeInfo.maxYear : state.year[1])
                         ]  // as [number, number] | [number, undefined] | [undefined, number]
                        :
                        state.year
                    );
                    const categories = (action.payload.mask & FilterField.CATEGORY) ? new Set<string>() : state.categories;
                    
                    const tagTypes = action.payload.tagTypes;
                    const tags = (
                        (action.payload.mask & FilterField.TAG)
                        ?
                        (
                            (tagTypes === undefined) 
                            ?
                            TAGTYPES.reduce((acc, t) => ({ ...acc, [t]: new Set() }), {})
                            :
                            (
                                Array.isArray(tagTypes)
                                ?
                                TAGTYPES.reduce((acc, t) => ({ ...acc, [t]: (tagTypes.includes(t) ? new Set<string>() : state.tags[t]) }), {})
                                :
                                TAGTYPES.reduce((acc, t) => ({ ...acc, [t]: (t === tagTypes ? new Set() : state.tags[t]) }), {})
                            )
                        )
                        :
                        state.tags
                    );
                    return {year, categories, tags: (<Record<TagType, Set<string>>>tags)};
                }
                return { year: undefined, categories: new Set<string>(), tags: <Record<TagType, Set<string>>>TAGTYPES.reduce((acc, t) => ({ ...acc, [t]: new Set() }), {}) };
            }

            case 'UPDATE_URL_PROJECT': {
                const prevId = state.openProjectId ?? null;
                const nextId = action.payload.projectId ?? null;
                
                const replace = !((prevId == null && nextId != null) || (prevId != null && nextId == null));
                

                return { 
                    ...state, 
                    openProjectId: nextId,
                    _urlReplace: replace  // temporary flag for the sync hook
                };
            }


            case 'INIT_FROM_URL': {
                const newState = {
                    categories: new Set<string>(action.payload.category),
                    year: action.payload.year,
                    openProjectId: action.payload.project ?? null,
                    tags: {
                        lang: new Set<string>(action.payload.lang),
                        skill: new Set<string>(action.payload.skill),
                        topic: new Set<string>(action.payload.topic)
                    },
                    urlProjectId: action.payload.project, // Store the URL project ID here
                };
                console.log('[filterReducer] INIT_FROM_URL new state:', newState);
                return newState;
            }

            case "CLEAR_URL_PROJECT": {
                const newState = {
                    ...state,
                    urlProjectId: undefined,
                };
                console.log('[filterReducer] CLEAR_URL_PROJECT new state:', newState);
                return newState;
            }

            // case 'OPEN_PROJECT': {
            //     const {id, changeCarouselState} = action.payload;
                
            // }

            default:
                // state.openProjectId = undefined;
                // state._urlReplace =
                return state;
        }
    }
}




export type ShowToastFn = (text: string) => void;
export type ScrollToFn = (index: number, jump?: boolean) => void;
