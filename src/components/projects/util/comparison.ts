import { TAGTYPES, type TagType } from "../filtering/common/filterTypes";

export const isEquivalentSet =  <T>(a: Set<T>, b: Set<T>) => a.size === b.size && [...a].every(x=>b.has(x))

export const isEquivalentSetToList = <T>(set: Set<T>, list: Array<T>) => {
    if(set.size > list.length) return false;
    const allowDupes = (set.size < list.length)
    const seen = new Set<T>();
    
    const listConforms = list.every((x)=>{
        if(seen.has(x)) {
            if(!allowDupes) return false;
        } else if(!set.has(x))
            return false;
        else
            seen.add(x);
        return true;
    })

    return listConforms && (!allowDupes || set.size === seen.size);
}

export function isEquivalentOptionalSet<T>(a: Set<T> | null | undefined, b: Set<T> | null | undefined): boolean {
    if(!!a?.size !== !!b?.size) return false;
    return !a?.size || [...a].every(x=>(b!).has(x))
}

export const compareYearRanges = (minYear: number, maxYear: number, a: [number | null, number | null] | null, b: [number | null, number | null] | null): boolean => {
     if(!(a || b)) return true;
    const [aHasMin, aHasMax] = a ? [
        a[0] === null || a[0] === undefined || a[0] <= minYear,
        a[1] === null || a[1] === undefined || a[1] >= maxYear
    ] : [true, true];

    const [bHasMin, bHasMax] = b ? [
        !b || b[0] === null || b[0] === undefined || b[0] <= minYear,
        !b ||b[1] === null || b[1] === undefined || b[1] >= maxYear
    ] : [true, true];

    const minEq = ((aHasMin === bHasMin) && aHasMin) || (a?.[0] === b?.[0]);
    const maxEq = ((aHasMax === bHasMax) && aHasMax) || (a?.[1] === b?.[1]);

    return minEq && maxEq;
}





export type TagCounts = {[key: string]: number}

export function isEqualTagCounts(a: TagCounts, b: TagCounts): boolean {
    const bKeys = new Set<string>(Object.keys(b));
    if(Object.entries(a).some(([k,v])=>(bKeys.delete(k) ? b[k] : 0) !== v))
        return false;
    if(bKeys.size && [...bKeys].some(k=>b[k]))
        return false;
    return true;
}

export function isEqualOptionalTagSet(a: Set<string> | undefined, b: Set<string> | undefined): boolean {
    if(a?.size && b?.size)
        return a.size === b.size && [...a].every(x=>b.has(x));
    return !a?.size && !b?.size;
}



export function isEquivalentTagsFilter(a: Partial<Record<TagType, Set<string> | null>> | null, b: Partial<Record<TagType, Set<string> | null>> | null) {
    if(!!a !== !!b) return false;
    if(!a) return false;
    for(const tt of TAGTYPES) {
        const aTags = a[tt] ?? null;
        const bTags = (b!)[tt] ?? null;
        if(!!aTags?.size !== !!bTags?.size) return false;
        if(aTags?.size && ![...aTags].every(x=>bTags!.has(x)))
            return false;
    }
    return true;
}
