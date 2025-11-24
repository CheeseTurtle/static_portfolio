import type { ProjectInfo, TagKey } from "@/components/projects/types";
import {createStore} from "zustand";
import { applyFilter, type FilterDataProps, type FilterStore, type TagFilterMode } from "./filterStore";
import { subscribeWithSelector } from "zustand/middleware";
import type { BrowserStore } from "../browserContext";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { getProjectKeyFromTagType, getTagTypeFromTagKey, TAGTYPES, type TagType } from "../filterTypes";
import React, { useRef } from "react";
import { PercentCircle } from "lucide-react";



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

// function getTagCounts<K extends TagKey>(projects: ProjectInfo[], keys: K): {[tag: string]: number};
// function getTagCounts<K extends TagKey>(projects: ProjectInfo[], keys: K[]): Record<K, {[tag: string]: number}>;
function getTagCounts<K extends TagKey>(projects: ProjectInfo[], keys: K[]): Record<K, {[tag: string]: number}> { // | {[tag: string]: number} {
    // if(typeof keys !== 'string') {
    //     return Object.fromEntries(keys.map(tagKey=>[tagKey as K, getTagCounts(projects, tagKey)]) as ([K, {[_: string]: number}][]));

    // }

    const ret: Partial<Pick<Record<TagKey, {[tag: string]: number}>, K>> = {};
    keys.forEach((key)=>{
        ret[key] = {};
    });

    projects.forEach(p=>{
        keys.forEach(k=>{
            const retk = ret[k]!;
            if(!p.tags[k]?.size) return;
            p.tags[k].forEach(t=>{
                retk[t] = (retk[t] ?? 0) + 1;
            })
        });
    });

    return ret as Pick<Record<TagKey, {[tag: string]: number}>, K>;
}

function getCategoryCounts(projects: ProjectInfo[]): {[cat: string]: number} {
    const categoryCounts: {[key: string]: number} = {};    
    projects.forEach(p=>{
        categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
    })
    return categoryCounts;
}


function getCounts(projects: ProjectInfo[], tagModes?: Record<TagType, TagFilterMode>, allProjects?: ProjectInfo[], spec?: Partial<FilterDataProps>): CountStoreData {
    const tagCounts: Record<TagKey, {[key: string]: number}> = {
        languages: {}, skills: {}, topics: {}
    };
    const categoryCounts: {[key: string]: number} = {};

    // if(spec)
    //     tagModes ??= spec.tagModes;

    if(!spec || !tagModes) {
        for(const p of projects) {
            categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
            Object.entries(p.tags).forEach(([tagKey, tags])=>{
                // const tagType = getTagTypeFromTagKey(tagKey as TagKey);
                // if(tagModes)
                const counts = tagCounts[tagKey as TagKey];
                tags.forEach(tag=>{
                    counts[tag] = (counts[tag] ?? 0) + 1;
                });
            });
        }
    } else {
        allProjects ??= projects;
        // tagModes ??= spec.tagModes;
        const withYear = (spec.year && (spec.year[0] || spec.year[1])) ? applyFilter({year: spec.year}, allProjects) : allProjects;
        
        const forCatCounts = (spec.tags && Object.values(spec.tags).some(x=>x.size)) ? applyFilter({tags: spec.tags, tagModes}, withYear) : withYear;
        forCatCounts.forEach(p=>{
            categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
        });

        if(Object.values(tagModes).some(x=>x)) {
            const forTagCounts = spec.categories?.size ? applyFilter({categories: spec.categories}, withYear) : withYear;
            Object.entries(tagCounts).forEach(([tagKey, counts])=>{
                const tagType = getTagTypeFromTagKey(tagKey as TagKey);
                const tagMode = tagModes[tagType];
                const forTagCounts_ = (()=>{
                    if(tagMode) { // OR (match any)
                        const filterKeys = (spec.tags ? Object.keys(spec.tags).filter(x=>x!==tagType) as TagType[] : undefined);
                        const filterTags = filterKeys?.length ? {[tagType]: new Set<string>(), ...Object.fromEntries(filterKeys.map(k=>[k, spec.tags![k]])) as Partial<Record<TagType, Set<string>>>} as Record<TagType, Set<string>>: undefined;
                        return filterTags ? applyFilter({tagModes, tags: filterTags}, forTagCounts) : forTagCounts;
                    } else { // AND (match all)
                        return projects;
                    }
                })();
                forTagCounts_.forEach(p=>{
                    const pTags = p.tags[tagKey as TagKey];
                    pTags.forEach(tag=>{
                        counts[tag] = (counts[tag] ?? 0) + 1;
                    });
                });
            });
        } else {
            const forTagCounts = ((spec.tags && Object.values(spec.tags).some(x=>x.size)) || spec.categories?.size) ? applyFilter({categories: spec.categories, tags: spec.tags, tagModes}, withYear) : withYear;
            forTagCounts.forEach(p=>{
                Object.entries(p.tags).forEach(([tagKey, tags])=>{
                    const counts = tagCounts[tagKey as TagKey];
                    tags.forEach(tag=>{
                        counts[tag] = (counts[tag] ?? 0) + 1;
                    });
                });
            });
        }
    }
    return {tagCounts, categoryCounts};
}


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


type ArrayMemberType<A extends any[]> = [A] extends [(infer T)[]] ? T : never;
type ArrayMemberType2<A extends any[]> = A extends [(infer T)[]] ? T : never;
type ArrayMemberType3<A extends any[]> = [A] extends (infer T)[] ? T : never;
type ArrayMemberType4<A extends any[]> = A extends (infer T)[] ? T : never;


type ArrayMemberType5<A extends any[]> = [A] extends ([infer T])[] ? T : never;
type ArrayMemberType6<A extends any[]> = A extends ([infer T])[] ? T : never;

type x1a = ArrayMemberType<(number | string)[]>;        // string | number
type x1b = ArrayMemberType<(number[] | string[])>;      // string | number

type x3a = ArrayMemberType3<(number | string)[]>;       // (string | number)[]
type x3b = ArrayMemberType3<(number[] | string[])>;     // string[] | number[]

type x4a = ArrayMemberType4<(number | string)[]>;       // string | number
type x4b = ArrayMemberType4<(number[] | string[])>;     // string | number


type x5a = ArrayMemberType5<[(number | string)][]>;     // never
type x5b = ArrayMemberType5<[(number[] | string[])]>;   // string[] | number[]
type x5c = ArrayMemberType5<([number] | [string])[]>;   // never
type x5d = ArrayMemberType5<[(number | string)[]]>;     // (string | number)[]

type x6a = ArrayMemberType6<[(number | string)][]>;     // string | number
type x6b = ArrayMemberType6<[(number[] | string[])]>;   // never
type x6c = ArrayMemberType6<([number] | [string])[]>;   // string | number
type x6d = ArrayMemberType6<[(number | string)[]]>;     // never




// type MemberOf<A> = ([A] extends [(infer T)[]] ? T : never);
type MemberOf<A> = (A extends (infer T)[] ? T : never);
// type MemberOf<A> = ([A] extends (infer T)[] ? T : never);  // NO

// type MemberOf<A> = (A extends [infer T1, ...infer Ts] ? ([] extends Ts ? T1 : [T1,MemberOf<Ts>]) : never);



// function pickProps<T extends any, Ks extends (keyof T)[]>(props: T, keys: Ks[]): (Ks extends (infer K extends keyof T)[] ? Pick<T, K> : never) {
// function pickProps<T extends any, Ks extends (keyof T)[]>(props: T, keys: Ks): Pick<T,MemberOf<Ks>> {
function pickProps<T extends any, K extends keyof T>(props: T, keys: K[]): Pick<T,K> {
    const ret: Partial<Pick<T, K>> = {};
    for(const key of keys) {
        // if(Object.prototype.hasOwnProperty.call(props, key))
        ret[key] = props[key];
    }
    return ret as Pick<T,K>;
}

function pickPropsFunc<T extends any, K extends keyof T>(keys: K[]): (props: T) => Pick<T,K> {
    return (props: T) => {
        const ret: Partial<Pick<T, K>> = {};
        for(const key of keys) {
            // if(Object.prototype.hasOwnProperty.call(props, key))
            ret[key] = props[key];
        }
        return ret as Pick<T,K>;
    };
}

// type RecordWithKeyType<T1 extends Record<any, any>, K2, K1 extends string | number | symbol = keyof T1> = T1 extends Record<infer K, infer V> ? (
//     Omit<T1, K1> & (
//         {[P in Extract<K2, K>]: }


//     )
// ) : never;


// type ConversionFn<I,O> = ((arg: I) => O) | ((arg: I, ...args?: any) => O);

// type ConversionInput<F extends ConversionFn<any, any>> = F extends ConversionFn<infer I, any> ? I : never;

// type ConversionOutput<F extends ConversionFn<any, any>> = F extends ConversionFn<any, infer O> ? O : never;

// type ConvertWithFn<F extends ConversionFn<any,any>, V extends ConversionInput<F>> = F extends ConversionFn<V, infer O extends ConversionOutput<F>> ? O : never;

// type RecordWithKeyType<T1 extends Record<any,any>, K2 extends string | number | symbol> = T1 extends Record<any, infer V> ? Record<K2, V> : never;

// type RecordWithConvertedKeyType<K1 extends string | number | symbol, K2 extends string | number | symbol, F extends ConversionFn<K1, K2>, R extends Record<K1, any>> = 
//     R extends Record<infer K extends K1, infer V> ? (
//         // {[K in K1]: [F extends ConversionFn<K, infer KP> ? ]}
//         F extends ConversionFn<K, infer KP extends K2> ? Record<KP, V> : never
// ) : never;


// type RecordWithConvertedKeyType2<K1 extends string | number | symbol, K2 extends string | number | symbol, F extends ConversionFn<K1, K2>, R extends Record<K1, any>> = 
//     {[K in keyof R]: F extends ConversionFn<K, infer KP> ? [KP, R[K]] : []} extends (infer NewR extends any) ? (
//         (NewR extends {[KP in keyof NewR]: infer VV extends [KP, any]} ? (
//             VV extends [infer KP extends string | number | symbol, infer VV] ? (
//                 Record<KP,VV>
//             ) : never
//         ) : never))
// : never;

// function conversionFn(value: number): 'NUM';
// function conversionFn(value: symbol): 'SYM';
// function conversionFn(value: symbol | number): 'SYM' | 'NUM' {
//     // return value.toString();
//     return (typeof value === 'number') ? 'NUM' : 'SYM';
// }

// const sym = Symbol('hello');
// // type R0 = Record<2 | 3 | 4 | 2 | typeof sym, string>;

// type T0 = {
//     [sym]: 'hello_sym',
//     2: '2_val',
//     3: '3_val',
//     4: '4_val'
// };
// const R0: T0 = {
//     [sym]: 'hello_sym',
//     2: '2_val',
//     3: '3_val',
//     4: '4_val'
// };

// // type x = typeof R0;
// // type x = [(typeof R0)] extends {[P in infer K]: infer V} ? Record<K,V> : never;
// // type x = [(typeof R0)] extends [{[P in infer K]: infer V}] ? Record<K,V> : never;
// // type x = (typeof R0) extends Record<infer K, infer V> ? [K,V] : never;
// // type x = (typeof R0) extends {[P in infer K]: infer V extends (typeof R0[P])} ? Record<K,V> : never;


// const v = ()=>{
//     const ret: any = {};
//     for(const [k,v] of Object.entries(R0)) {
//         const key = k as unknown as Exclude<keyof T0, symbol>;
//         const newKey = conversionFn(key);
//         ret[newKey] = v;
//     }
//     for(const k of Object.getOwnPropertySymbols(R0)) {
//         const key = k as unknown as (typeof k extends keyof T0 ? Extract<typeof k, keyof T0> : Extract<keyof T0, symbol>);
//         const newKey = conversionFn(key);
//         ret[newKey] = R0[key as unknown as keyof T0];
//     }

//     return ret;
// };

// type x = RecordWithConvertedKeyType<keyof T0, any, typeof conversionFn, T0>;

// // function convertRecordKeys<R1 extends Record<any, any>, T2 extends Record<, V>>()


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

        filterStore.subscribe(s=>({year: s.year, categories: s.categories, tags: s.tags, tagModes: s.tagModes} as FilterDataProps), (spec, prevSpec) => {
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
                const newCounts = getCounts(projects, tagModes, allProjects, spec);
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
