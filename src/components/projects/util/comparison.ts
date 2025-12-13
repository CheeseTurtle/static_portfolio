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