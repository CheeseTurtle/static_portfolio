import type { UnpackTypeUnion } from '@/lib/type-utils';
import { never } from 'astro:schema';
import React from 'react';
import { useInterpContext } from './interpContext';


export type InterpProps = {
    level: number,
    detail: number,
    topics?: string[],
} & React.ComponentPropsWithRef<'span'>

// export type InterpCaseProps<Kind extends 'level' | 'detail' | 'topics'> = (
//     ('level' extends Kind ? {level: number} : never)
//     |
//     ('detail' extends Kind ? {detail: number} : never)
//     |
//     ('topics' extends Kind ? {topics?: string[]} : never)
// ) & React.ComponentPropsWithRef<'span'>;

type _InterpCaseProps = {level?: number, detail?: number}

type InterpLevelNonDefaultCaseProps<L extends number> = _InterpCaseProps & {level: L};
type InterpLevelDefaultCaseProps<L extends 0 = 0> = _InterpCaseProps & {level?: L};
type InterpDetailNonDefaultCaseProps<D extends number> = _InterpCaseProps & {detail: D};
type InterpDetailDefaultCaseProps<D extends 0 = 0> = _InterpCaseProps & {detail?: D};

type InterpCaseProps<Kind extends 'level' | 'detail', IsDefault extends boolean | undefined = undefined, N extends (IsDefault extends true ? 0 : number) = any> = (
    (
        Kind extends 'level' ? (
            (IsDefault extends true | undefined  ? (N extends 0 ? InterpLevelDefaultCaseProps<N> : never) : never)
            |
            (IsDefault extends false | undefined ? InterpLevelNonDefaultCaseProps<N> : never)
        ) : never
    )
    |
    (
        Kind extends 'detail' ? (
            (IsDefault extends true | undefined ? (N extends 0 ? InterpDetailDefaultCaseProps<N> : never) : never)
            |
            (IsDefault extends false | undefined ? InterpDetailNonDefaultCaseProps<N> : never)
        ) : never
    )
) & React.ComponentPropsWithRef<'span'>;

// type InterpSwitchChildren = Exclude<Extract<NonNullable<React.ReactNode>, object>, React.ReactPortal | Promise<any>>;
// type InterpSwitchChildren = React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode>

type InterpCaseElem<Kind extends 'level' | 'detail', N extends number = number, IsDefault extends boolean | undefined = undefined > = React.ReactElement<InterpCaseProps<Kind, 
    (IsDefault extends undefined ? (0 extends N ? true : (N extends 0 ? undefined : false)) : IsDefault)
>, typeof InterpCase>;


type SeqEndingWith<E,T=any> = [...T[], E];

// type RemoveArrayRepeats<T extends readonly any[]> = {
//     [K in keyof T]: (
//         T[number] extends { [P in keyof T]: P extends K ? never : T[P] }[number]
//         ? never
//         : T[K]
//     )
// }

// type NonRepeatingArray<T, A extends T[] = T[]> = A & RemoveArrayRepeats<A>;



// type IteratorEndingWith<T,E> = Iterator<SeqEndingWith<T,E>>
// type IterableEndingWith<E,T=any> = SeqEndingWith<E,T> extends infer I extends ArrayLike<any> ? I : never;
// type x<E,T> = Omit<SeqEndingWith<E,T>, keyof ArrayLike<any>>

// type Flatten<T> = T extends any[] ? T[number] : T;
// type Flatten2<T> = T extends Array<infer Item> ? Item : T;

// type ToArrayDist<Type> = Type extends any ? Type[] : never;
// type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;

// type ToArrayDist2<Type> = Type extends infer _ extends any ? Type[] : never;
// type ToArrayNonDist2<Type> = [Type] extends [any] ? Type[] : never;

// const obj = {
//   str: 'strval',
//   num: 25,
//   bool: true,
//   obj: new Object(),
//   undef: undefined,
//   nil: null,
// }
// type Obj = typeof obj;
// type oe = ToArrayDist<keyof Obj>;



// type Keys = ['abc','def','ghi'];
// type KeyType = Keys extends ArrayLike<(infer K)> ? K : never;

// type KeyObj = KeyType extends keyof (infer Obj) ? Obj : never;

// type ListOfKeys<T> = (keyof T extends string | number | symbol ? 
//     {[K in keyof T]: Exclude<keyof T, K>}
//  : []);
 

// type MemberType<A extends ArrayLike<any>> = A extends ArrayLike<infer T> ? T : never;
 
// type NonRepeatingArray_<A extends T[], T = MemberType<A>> = A extends [infer First extends T, ...infer Rest extends T[]] ? (
//     (Rest extends (infer RestType extends Exclude<T,First>)[] ? [First, NonRepeatingArray_<Rest, RestType>] : never)
// ) : [];

// // type NonRepeatingArray<T, First extends T> = [First, ...Exclude<T,First>[]]
// // type NonRepeatingArray<T, First extends T> = T extends never ? [] : [First, ...NonRepeatingArray<Exclude<T, First>>];


// type AsKeys<K> = K extends keyof (infer Obj) ? keyof Obj : never;

// type tt = ToArrayNonDist<KeyType>

// type NonRepeatingArray<T extends string | number | symbol> = T extends never ? [] : (
//     // infer A extends T[] ? A extends extends [infer First extends T, ...infer Rest extends T[]] ? (
//     //     A extends [First, ...infer Rest extends Exclude<T, First>[]] ? (


//     //     ) : never
//     // ) 
// );
// // const xx: NonRepeatingArray<KeyType> = ['abc', 'abc']


type InterpSwitchChildren<Kind extends 'level' | 'detail'> = (
    SeqEndingWith<InterpCaseElem<Kind, 0, true>, InterpCaseElem<Kind, Exclude<number, 0>, false>>
    | InterpCaseElem<Kind, Exclude<number, 0>, false>
    | null | undefined
);
export type InterpSwitchProps<Kind extends 'level' | 'detail'> = React.ComponentPropsWithRef<'span'> & {
    kind: Kind,
    // cutoff: number,
    children?: InterpSwitchChildren<Kind>,
}


const InterpSwitchContext = React.createContext<undefined | null | React.ComponentPropsWithRef<'span'>>(null);




function passesInterpFilter(values: {level?: number, detail?: number, topics?: string[]}, filter: {level?: number, detail?: number, topics?: 'all' | string[]}): boolean {
    const {topics, level, detail} = filter;
    if(Array.isArray(topics) && topics?.length && undefined !== values.topics) {
        if(values.topics.some(x=>!topics.includes(x))) return false;
    }
    if(level && values.level && level < values.level) return false;
    if(detail && values.detail && detail < values.detail) return false;
    return true;    
}

const Interp = ({level=0, detail=0,topics=[], ...props}: InterpProps) => {
    const {level: filterLevel, topics: filterTopics, detail: filterDetail} = useInterpContext();
    const passes = React.useMemo(()=>passesInterpFilter({level,detail,topics}, {level: filterLevel, detail: filterDetail, topics: filterTopics}), [level,detail,topics,filterLevel,filterDetail,filterTopics])
    return passes && <span {...props}/>
}


const InterpSwitch = <Kind extends 'level' | 'detail'>({kind, children, key, ...props}: InterpSwitchProps<Kind>) => {
    const ctx = useInterpContext();
    const cutoff = ctx[kind];
    const child = (Array.isArray(children)) ? children.find(child=>passesInterpFilter(child.props, {[kind]: cutoff})) : children;
    return child && <InterpSwitchContext.Provider key={key} value={props}>
        {child}
    </InterpSwitchContext.Provider>
}

const InterpCase = <Kind extends 'level' | 'detail'>({level, detail, children, ...props}: InterpCaseProps<Kind, any>) => {
    const defaultProps = React.useContext(InterpSwitchContext);
    if(defaultProps === null) throw new Error('Not in the subtree of an InterpSwitch element');
    const props_ = React.useMemo(()=>({...defaultProps, ...props}), [props, defaultProps]);
    return <span {...props_}>{children}</span>
}



export type HoverDetailsProps = {


} & React.ComponentProps<'span'>


export {InterpSwitch, InterpCase, Interp};