/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ValueOf } from "node_modules/astro/dist/type-utils";
import type React from "react";




type RefAttributesOnly<T> = Omit<React.RefAttributes<T>, "key">;

type PropsWithRef<T,H> = React.PropsWithoutRef<T> & RefAttributesOnly<H>;




// type MappedTypeWithNewProperties<Type> = {
//     [Property in keyof Type as Exclude<Property, "hello">]: Type[Property]
// }



export type ValueFor<T, K extends keyof T> = T[K];
export type EntryFor<T, K extends keyof T> = (
    (T extends {[P in K]: infer V}
    ?
    [K, V]
    : 
    never
));
// type x = EntryFor<FilterStoreState, "allProjects" | "categories">;

export type KeyOf<T> = T extends any ? keyof T : never;



// type EntryOf<T> = T extends any ? (T extends {[P in keyof T]: (infer V extends T[P])} ? [keyof T,V] : never) : never;
export type EntryOf<T> = ValueOf<{[K in keyof T]: [K, T[K]]}>;
// type EntryOf<T> = T extends Map<infer K, infer V> ? [K, V] : (T extends Record<infer K, infer V> ? [K, V] : never);

export type EntriesOf<T> = EntryOf<T>[];

// type x = EntryOf<FilterStoreState>; // | ValueOf<FilterStoreState>;










type And<A,B> = (A extends true ? (B extends true ? true : false) : false);
type IsExtensionOf<A,B> = A extends B ? true : false;
type RecipExtends<A,B> = And<A extends B ? true : false, B extends A ? true : false>;

type IsSameType<T1,T2> = (T1 extends T2 ? (T2 extends T1 ? true : false) : false);
type IsEquivalentType<T1,T2> = And<RecipExtends<Exclude<T1,T2>, never>, RecipExtends<Exclude<T2,T1>, never>> extends true ? (
    And<
        And<RecipExtends<Extract<T1, T2>, T1>, RecipExtends<Extract<T1, T2>, T2>>,
        And<RecipExtends<Extract<T2, T1>, T1>, RecipExtends<Extract<T2, T1>, T2>>
    >
) : false;

type UnpackTypeUnion<U> = U extends (infer T1 | infer T2) ? (IsEquivalentType<T1,T2> extends true ? U : (
    UnpackTypeUnion<T1> | UnpackTypeUnion<T2>
)) : U;

type TypeKeyType<T> =  keyof T;


type GeneralizeToPrimitive<U,T> = Exclude<U, T> extends never ? (U extends T ? T : U) : T | Exclude<U, T>;

type GeneralizeToPrimitiveString<U> = GeneralizeToPrimitive<U, string>;
type GeneralizeToPrimitiveNumber<U> = GeneralizeToPrimitive<U, number>;
type GeneralizeToPrimitiveBoolean<U> = GeneralizeToPrimitive<U, boolean>;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type GeneralizeToPrimitiveFunction<U> = GeneralizeToPrimitive<U, Function>;
type GeneralizeToPrimitiveBigint<U> = GeneralizeToPrimitive<U, bigint>;
type GeneralizeToPrimitiveSymbol<U> = GeneralizeToPrimitive<U, symbol>;
type GeneralizeToPrimitiveUndefined<U> = GeneralizeToPrimitive<U, undefined>;

type GeneralizeToPrimitiveNull<U> = GeneralizeToPrimitive<U, null>;
type GeneralizeToPrimitiveObject<U> = GeneralizeToPrimitive<U, object>;



// type MakeArray<A> = (A extends (infer T)[] | [] ? T[] : [A,]);

// type JoinArray<A,B> = [...MakeArray<A>, ...MakeArray<B>]

// type UnionToArray<U> = U extends (infer T1 | infer T2) ? (IsEquivalentType<T1,T2> extends true ? (
//     MakeArray<T1>
// ) : (
//     JoinArray<UnionToArray<T1>, UnionToArray<T2>>
// )) : [U];

// type x = UnionToArray<'a' | 'b'>;


// type GeneralizeKeyTypes = [Key] extends ([infer P]) ? P : never;


export type DualExclude<T1,T2> = Exclude<T1,T2> | Exclude<T2,T1>;

export type DualExtract<T1,T2> = Extract<T1,T2> | Extract<T2,T1>;

// type x = IsEquivalentType<GeneralizeKeyTypes<ButtonProps>, keyof ButtonProps>;


// type OmitTyped<T, K extends Key, V> = T extends any ? (
//     // T extends {[P in infer KT extends K]: infer VT extends V} ?
//     Extract<K, keyof T> extends infer MatchingKeys extends keyof T ? (
//     {[Key in MatchingKeys]: (T[Key] extends V ? Key : never)}
//     ) : never
// ) : T;

export type OmitTyped<T, K extends keyof T, V> = T extends any ? (
    {[P in keyof T]: P extends K ? Exclude<T[P], V> : T[P]}
) : T;

// type x = OmitTyped<ButtonProps, "children", string | number>['children'];


export type ExtractValueType<T, Key extends keyof T, Never = never> = T[Key] extends infer ValueType ? ValueType : Never;











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
export type MemberOf<A> = (A extends (infer T)[] ? T : never);
// type MemberOf<A> = ([A] extends (infer T)[] ? T : never);  // NO

// type MemberOf<A> = (A extends [infer T1, ...infer Ts] ? ([] extends Ts ? T1 : [T1,MemberOf<Ts>]) : never);



// function pickProps<T extends any, Ks extends (keyof T)[]>(props: T, keys: Ks[]): (Ks extends (infer K extends keyof T)[] ? Pick<T, K> : never) {
// function pickProps<T extends any, Ks extends (keyof T)[]>(props: T, keys: Ks): Pick<T,MemberOf<Ks>> {
function pickProps<T, K extends keyof T>(props: T, keys: K[]): Pick<T,K> {
    const ret: Partial<Pick<T, K>> = {};
    for(const key of keys) {
        // if(Object.prototype.hasOwnProperty.call(props, key))
        ret[key] = props[key];
    }
    return ret as Pick<T,K>;
}

function pickPropsFunc<T, K extends keyof T>(keys: K[]): (props: T) => Pick<T,K> {
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





export type PropsWithoutChildren<Props> = Props extends any ? (Props extends {children?: React.ReactNode | undefined} ? Omit<Props, "children"> : Props) : Props;
// Props extends any ? ("ref" extends keyof Props ? Omit<Props, "ref"> : Props) : Props;



export type IsAny<T> = [T] extends [any] ? (any extends T ? true : false) : false;
export type IsUnknown<T> = unknown extends T ? true : false;

export type PropsWithout<Props, K extends string, V = any> = Props extends any ? (
    IsAny<V> extends true ?
        ((K extends keyof Props ? Omit<Props, K> : Props))
        : (Props extends {[P in K]: infer VT} ? (VT extends V ? Omit<Props, K> : Props) : Props)
) : Props;


type _WithProperty<Props, K extends PropertyKey, V = unknown, Optional extends boolean = false> = (Optional extends true ? WithOptionalProperty<Props,K,V> : WithProperty<Props,K,V>);
export type WithProperty<Props, K extends PropertyKey, V = unknown> = Props & {[P in K]: V};
export type WithOptionalProperty<Props, K extends PropertyKey, V = unknown> = Props & {[P in K]?: V};


export type Or<A,B> = A extends true ? true : (B extends true ? true : false);

type _PropsWithPropType<Props, K extends string, V1, V0 = unknown, Optional extends boolean = false> = Props extends any ? (
    Or<IsAny<V0>, IsUnknown<V0>> extends true ?
        ((K extends keyof Props ? Omit<Props, K> : Props)) & {[P in K]: V1}
        : (Props extends {[P in K]: infer VT} ? (VT extends V0 ? _WithProperty<Omit<Props, K>, K, V1, Optional> : Props) : Props & {[P in K]: V1})
) : Props;

export type PropsWithPropType<Props, K extends string, V1, V0 = unknown> = _PropsWithPropType<Props,K,V1,V0,false>;
export type PropsWithOptionalPropType<Props, K extends string, V1, V0 = unknown> = _PropsWithPropType<Props,K,V1,V0,true>;
export type OneChildOrNoChildren = Exclude<React.ReactNode, Iterable<React.ReactNode>>;
