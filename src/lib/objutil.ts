import type { ValueOf } from "node_modules/astro/dist/type-utils";
import type { EntriesOf, EntryOf, EntryFor, ValueFor } from "./type-utils";


export function getEntriesOf<T extends object>(obj: T): EntriesOf<T> {
    return Object.entries(obj) as EntriesOf<T>
}

export function createRecordFromKeys<R extends Record<K,V>, K extends string | number | symbol = keyof R, V = ValueOf<Pick<R,K>>>(keys: Array<keyof R>, fn: <K extends keyof R>(key: K, index: number, array: typeof keys) => R[K]): R {
    return Object.fromEntries(keys.map((k, i, arr) =>[k,fn(k,i,arr)])) as R;
}
export function createRecordFromEntriesWithNewKeys<R extends Record<any, any>, I extends Partial<Record<any,any>> = Partial<Record<any, any>>>(entries: EntriesOf<I>,  fn: (entry: EntryOf<I>, index: number, array: typeof entries) => EntryOf<R>): R {
    return Object.fromEntries(entries.map((entry, i, arr) =>fn(entry,i,arr))) as R;
}

export function createRecordFromObjectWithNewKeys<R extends Record<any, any>, I extends object = R>(
    obj: I, fn: (entry: EntryOf<I>, index: number, array: EntriesOf<I>) => EntryOf<R>,
): R {
    return createRecordFromEntriesWithNewKeys(Object.entries(obj) as EntriesOf<I>, fn)
}



export function createRecordFromEntries<R extends Record<any, any>, I extends Record<keyof R, any>>(entries: EntriesOf<I>, fn: <E extends EntryOf<I>, K = (E extends EntryFor<I,infer K> ? K : never)>(entry: E, index: number, array: typeof entries) => ValueOf<R>): R {
    return Object.fromEntries(entries.map((entry, i, arr) =>[entry[0], fn(entry,i,arr)])) as R;
}

export function createRecordFromObject<R extends Record<any, any>, I extends Record<keyof R, any>>(
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    obj: I, fn: <E extends EntryOf<I>, K = (E extends EntryFor<I,infer K> ? K : never)>(entry: E, index: number, array: EntriesOf<I>) => ValueOf<R> | ValueFor<R,K>
): R {
    return createRecordFromEntries(Object.entries(obj) as EntriesOf<I>, fn)
}



export function createArrayFromEntries<R, I extends Record<keyof R, any>>(entries: EntriesOf<I>, fn: <E extends EntryOf<I>, K = (E extends EntryFor<I,infer K> ? K : never)>(entry: E, index: number, array: typeof entries) => R): R[] {
    return entries.map((entry, i, arr) =>fn(entry,i,arr))
}


export function createArrayFromObject<R, I extends Record<keyof R, any>>(
    obj: I, fn: <E extends EntryOf<I>>(entry: E, index: number, array: EntriesOf<I>) => R
): R[] {
    return createArrayFromEntries(Object.entries(obj) as EntriesOf<I>, fn)
}

