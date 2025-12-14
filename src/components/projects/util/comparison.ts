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
