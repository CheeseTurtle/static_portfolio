/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { FilterStoreState } from "@/components/projects/filtering/common/stores/filterStore";
import type { ValueOf } from "node_modules/astro/dist/type-utils";
import type React from "react";

type RefAttributesOnly<T> = Omit<React.RefAttributes<T>, "key">;

type PropsWithRef<T, H> = React.PropsWithoutRef<T> & RefAttributesOnly<H>;

// type MappedTypeWithNewProperties<Type> = {
//     [Property in keyof Type as Exclude<Property, "hello">]: Type[Property]
// }


export type Defined<T> = Exclude<T, undefined>
export type NonNull<T> = Exclude<T, null>

export type Optional<T> = T | undefined
export type MaybeNull<T> = T | null
export type Nullable<T> = T | null | undefined





// export type ArrayOfTypeUnionMembers<U> = [U] extends [infer T1 | infer T2] ? (
//   IsEquivalentType<T1, T2> extends true ? [U] : [...ArrayOfTypeUnionMembers<T1>, ...ArrayOfTypeUnionMembers<T2>]
// ) : [U]
export type ArrayOfTypeUnionMembers<U> = U extends (infer T1 | infer T2) ? (
  T2 extends Exclude<U, T1> ?  [T1] : []
  // IsEquivalentType<T1, T2> extends true ? [U] : []
) : []


// // type kk = [('a' | 'b')] extends ([infer A] | [infer B]) ? B : never
// type k0 = ('a' | 'b' | 'c' | 'd')
// type kk<T0, T,K> = K extends keyof T ? [ValueOf<{[KK in k0]: [T[KK], ...kk<k0, T, Exclude<K, KK>>]}>] : []
// // type kk2<V, K> = K extends keyof V ? [V[K], ...kk2<V, Exclude<keyof V, K>>] : []
// // type x = kk2<kk, keyof kk>

// type x = kk<k0, {[K in k0]: K}, any>

const obj = {
  str: 'strval',
  num: 25,
  bool: true,
  obj: new Object(),
  undef: undefined,
  nil: null,
}
type Obj = typeof obj;

type Flatten<T> = T extends any[] ? T[number] : T;
type Flatten2<T> = T extends Array<infer Item> ? Item : T;

type ToArrayDist<Type> = Type extends any ? Type[] : never;
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;

type ToArrayDist2<Type> = Type extends infer _ extends any ? Type[] : never;
type ToArrayNonDist2<Type> = [Type] extends [any] ? Type[] : never;


// // type oe = [keyof Obj] extends [infer X] ? X[] : never
// // type oe = keyof Obj extends infer X ? X[] : never

// // type oe = ToArrayDist<keyof Obj>

// type FromArray<T> = T extends (infer AT)[] ? (
//   T extends [infer T1 extends AT, ...infer TRest] ? [T1, ...FromArray<TRest>] : T
// ) : never

// type tt = FromArray<(string | boolean)[]>

export type And<A, B> = A extends true ? (B extends true ? true : false) : false;

type Cond<C,T,F> = C extends true ? T : (C extends false ? F : never);
type Tern<C,T,O> = C extends true ? T : O;

export type IsExtensionOf<A, B> = A extends B ? true : false;
export type RecipExtends<A, B> = And<
  A extends B ? true : false,
  B extends A ? true : false
>;

export type IsSameType<T1, T2> = T1 extends T2
  ? T2 extends T1
    ? true
    : false
  : false;
export type IsEquivalentType<T1, T2> =
  And<
    RecipExtends<Exclude<T1, T2>, never>,
    RecipExtends<Exclude<T2, T1>, never>
  > extends true
    ? And<
        And<
          RecipExtends<Extract<T1, T2>, T1>,
          RecipExtends<Extract<T1, T2>, T2>
        >,
        And<
          RecipExtends<Extract<T2, T1>, T1>,
          RecipExtends<Extract<T2, T1>, T2>
        >
      >
    : false;

export type UnpackTypeUnion<U> = U extends infer T1 | infer T2
  ? IsEquivalentType<T1, T2> extends true
    ? U
    : UnpackTypeUnion<T1> | UnpackTypeUnion<T2>
  : U;

type TypeKeyType<T> = keyof T;


export type ValueFor<T, K extends keyof T> = T[K];
// export type TypedValueFor<T, K extends keyof T, VT extends ValueOf<T> = ValueOf<T>> = T extends Record<K, infer VType extends VT> ? (T extends {[P in K]: infer V extends VT} ? Extract<VT, V> : never) : never
export type TypedValueFor<T, K extends keyof T> = T extends Partial<Record<infer _ extends K, infer VT extends ValueOf<T>>> ? VT : never
export type EntryFor_<T, K extends keyof T> = T extends { [P in K]: infer V }
  ? [K, V]
  : never;



// export type EntryFor<T, K extends keyof T> = (K extends [infer KK extends keyof T] ? [K,T[K]] : never)
export type EntryFor<T, K extends keyof T> = T extends {[P in K]: infer V} ? EntryOf<{[P in K]: T[P]}> : never;

// export type EntryFor<T, K extends keyof T> = ArrayOfTypeUnionMembers<K>

// export type ExactEntryFor<T, K> = [K, K extends keyof T ? T[K]: never]
export type SomeEntryFor<T, K extends keyof T> = [K, T[K]]

// type x = EntryFor<FilterStoreState, "allProjects" | "categories">;
// type x = SomeEntryFor<FilterStoreState, "allProjects" | "categories">;
  
export type KeyOf<T> = T extends any ? keyof T : never;

// type EntryOf<T> = T extends any ? (T extends {[P in keyof T]: (infer V extends T[P])} ? [keyof T,V] : never) : never;
export type EntryOf<T> = ValueOf<{ [K in keyof T]: [K, T[K]] }>;
// type EntryOf<T> = T extends Map<infer K, infer V> ? [K, V] : (T extends Record<infer K, infer V> ? [K, V] : never);

export type EntriesOf<T> = EntryOf<T>[];

// type x = EntryOf<FilterStoreState>; // | ValueOf<FilterStoreState>;

type T = {};
type x = undefined;

// type RevealType<T> = T extends Extract<infer TT, any> ? TT : never;

// type z = RevealType<string>;
// export const revealType = <T>(x: T): T => [x][0];
const xx = [0 as unknown as x][0];



type GeneralizeToPrimitive<U, T> =
  Exclude<U, T> extends never ? (U extends T ? T : U) : T | Exclude<U, T>;

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

export type DualExclude<T1, T2> = Exclude<T1, T2> | Exclude<T2, T1>;

export type DualExtract<T1, T2> = Extract<T1, T2> | Extract<T2, T1>;

// type x = IsEquivalentType<GeneralizeKeyTypes<ButtonProps>, keyof ButtonProps>;

// type OmitTyped<T, K extends Key, V> = T extends any ? (
//     // T extends {[P in infer KT extends K]: infer VT extends V} ?
//     Extract<K, keyof T> extends infer MatchingKeys extends keyof T ? (
//     {[Key in MatchingKeys]: (T[Key] extends V ? Key : never)}
//     ) : never
// ) : T;

export type OmitTyped<T, K extends keyof T, V> = T extends any
  ? { [P in keyof T]: P extends K ? Exclude<T[P], V> : T[P] }
  : T;

// type x = OmitTyped<ButtonProps, "children", string | number>['children'];

export type ExtractValueType<
  T,
  Key extends keyof T,
  Never = never,
> = T[Key] extends infer ValueType ? ValueType : Never;

type ArrayMemberType<A extends any[]> = [A] extends [(infer T)[]] ? T : never;
type ArrayMemberType2<A extends any[]> = A extends [(infer T)[]] ? T : never;
type ArrayMemberType3<A extends any[]> = [A] extends (infer T)[] ? T : never;
type ArrayMemberType4<A extends any[]> = A extends (infer T)[] ? T : never;

type ArrayMemberType5<A extends any[]> = [A] extends [infer T][] ? T : never;
type ArrayMemberType6<A extends any[]> = A extends [infer T][] ? T : never;

type x1a = ArrayMemberType<(number | string)[]>; // string | number
type x1b = ArrayMemberType<number[] | string[]>; // string | number

type x3a = ArrayMemberType3<(number | string)[]>; // (string | number)[]
type x3b = ArrayMemberType3<number[] | string[]>; // string[] | number[]

type x4a = ArrayMemberType4<(number | string)[]>; // string | number
type x4b = ArrayMemberType4<number[] | string[]>; // string | number

type x5a = ArrayMemberType5<[number | string][]>; // never
type x5b = ArrayMemberType5<[number[] | string[]]>; // string[] | number[]
type x5c = ArrayMemberType5<([number] | [string])[]>; // never
type x5d = ArrayMemberType5<[(number | string)[]]>; // (string | number)[]

type x6a = ArrayMemberType6<[number | string][]>; // string | number
type x6b = ArrayMemberType6<[number[] | string[]]>; // never
type x6c = ArrayMemberType6<([number] | [string])[]>; // string | number
type x6d = ArrayMemberType6<[(number | string)[]]>; // never

// type MemberOf<A> = ([A] extends [(infer T)[]] ? T : never);
export type MemberOf<A> = A extends (infer T)[] ? T : never;
// type MemberOf<A> = ([A] extends (infer T)[] ? T : never);  // NO

// type MemberOf<A> = (A extends [infer T1, ...infer Ts] ? ([] extends Ts ? T1 : [T1,MemberOf<Ts>]) : never);

// function pickProps<T extends any, Ks extends (keyof T)[]>(props: T, keys: Ks[]): (Ks extends (infer K extends keyof T)[] ? Pick<T, K> : never) {
// function pickProps<T extends any, Ks extends (keyof T)[]>(props: T, keys: Ks): Pick<T,MemberOf<Ks>> {
function pickProps<T, K extends keyof T>(props: T, keys: K[]): Pick<T, K> {
  const ret: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    // if(Object.prototype.hasOwnProperty.call(props, key))
    ret[key] = props[key];
  }
  return ret as Pick<T, K>;
}

function pickPropsFunc<T, K extends keyof T>(
  keys: K[],
): (props: T) => Pick<T, K> {
  return (props: T) => {
    const ret: Partial<Pick<T, K>> = {};
    for (const key of keys) {
      // if(Object.prototype.hasOwnProperty.call(props, key))
      ret[key] = props[key];
    }
    return ret as Pick<T, K>;
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

export type PropsWithoutChildren<Props> = Props extends any
  ? Props extends { children?: React.ReactNode | undefined }
    ? Omit<Props, "children">
    : Props
  : Props;
// Props extends any ? ("ref" extends keyof Props ? Omit<Props, "ref"> : Props) : Props;

export type IsAny<T> = [T] extends [any]
  ? any extends T
    ? true
    : false
  : false;
export type IsUnknown<T> = unknown extends T ? true : false;

export type PropsWithout<Props, K extends string, V = any> = Props extends any
  ? IsAny<V> extends true
    ? K extends keyof Props
      ? Omit<Props, K>
      : Props
    : Props extends { [P in K]: infer VT }
      ? VT extends V
        ? Omit<Props, K>
        : Props
      : Props
  : Props;

type _WithProperty<
  Props,
  K extends PropertyKey,
  V = unknown,
  Optional extends boolean = false,
> = Optional extends true
  ? WithOptionalProperty<Props, K, V>
  : WithProperty<Props, K, V>;
export type WithProperty<Props, K extends PropertyKey, V = unknown> = Props & {
  [P in K]: V;
};
export type WithOptionalProperty<
  Props,
  K extends PropertyKey,
  V = unknown,
> = Props & { [P in K]?: V };

export type Or<A, B> = A extends true ? true : B extends true ? true : false;

type _PropsWithPropType<
  Props,
  K extends string,
  V1,
  V0 = unknown,
  Optional extends boolean = false,
> = Props extends any
  ? Or<IsAny<V0>, IsUnknown<V0>> extends true
    ? (K extends keyof Props ? Omit<Props, K> : Props) & { [P in K]: V1 }
    : Props extends { [P in K]: infer VT }
      ? VT extends V0
        ? _WithProperty<Omit<Props, K>, K, V1, Optional>
        : Props
      : Props & { [P in K]: V1 }
  : Props;

export type PropsWithPropType<
  Props,
  K extends string,
  V1,
  V0 = unknown,
> = _PropsWithPropType<Props, K, V1, V0, false>;
export type PropsWithOptionalPropType<
  Props,
  K extends string,
  V1,
  V0 = unknown,
> = _PropsWithPropType<Props, K, V1, V0, true>;
export type OneChildOrNoChildren = Exclude<
  React.ReactNode,
  Iterable<React.ReactNode>
>;

// /**
//  * Obtain the parameters of a function type in a tuple
//  */
// type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// /**
//  * Obtain the parameters of a constructor function type in a tuple
//  */
// type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;

// /**
//  * Obtain the return type of a constructor function type
//  */
// type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;

export type Callable<P extends any[],R> = ((...args: P) => R) | (new (...args: P) => R)
export type CallableArgsAndRet<T extends Callable<any, any>> = T extends Callable<infer P, infer R> ? [P, R] : never;

export type ConstructorFnArgsAndRet<T extends new (...args: any) => any> = T extends new (...args: infer P) => infer R ? [P,R] : never

export type ConstructorFn<P extends any[] = any, R = any> = abstract new (
  ...args: P
) => R;

// type FirstArg<F extends Function> = F extends ((arg: infer A, ...args: any) => any) ? A : never;


function fy(a: string): string;
function fy(a: number, b: any): boolean;
function fy(a: number | string, b?: any): boolean | string {
    if(typeof a === 'string') return a;
    return a == b;
}
type Y = typeof fy;


type X = {
    (a: string): string,
    (a: number, b: boolean): boolean,
    (a: boolean, b: number): null,
};


// type Z = Extract<X,Y> // Identical to Y
// type Z = Exclude<Y, X> // Identical to X
// type Z = Extract<Y, Exclude<Y, X>> // Identical to X

// type Z = X & Y;
// type Z = X | Y;


// type XX = X extends ((a: string, b: infer P) => any) ? P : never;        // number**
// type XX = X extends {(a: string, b: infer P): any} ? P : never;          // number**

// type XX = X extends ((arg: string, ...args: infer P) => any) ? P : never    // number**
// type XX = X extends ((arg: string, ...args: infer P) => string) ? P : never    // number**
// type XX = X extends ((a: infer A extends string, b: infer B) => string) ? B : never; // number**
// type XX = X extends ((a: infer A extends string, b: infer B extends boolean) => string) ? B : never; // boolean**

// type XX = X extends ((a: infer A extends string, b: boolean) => string) ? A : never; // string**
// type XX = X extends ((a: infer A extends boolean, b: boolean) => string) ? A : never; // never
// type XX = X extends ((a: infer A extends boolean, b: boolean) => null) ? A : never; // never
// type XX = X extends ((a: infer A extends boolean, b: infer B extends boolean) => null) ? A : never; // never
// type XX = X extends ((a: infer A extends boolean, b: infer B extends boolean) => infer R) ? A : never; // never
// type XX = X extends ((a: infer A extends boolean, b: infer B) => infer R) ? A : never; // boolean


// type XX = X extends {(...args: [string, ...infer P]): any} ? P : never;   // [b: number]
// type XX = X extends {(...args: infer P extends [string]): any} ? P : never; // [string]

// type XP = Parameters<X extends infer XX extends (a: number, b: boolean) => any ? (a: number, b: boolean) => any : never>

// type XX = X extends (a: boolean, b: infer B) => null ? B : never;        // number
// type XX = X extends (a: boolean, b: infer B) => any ? B : never;         // number
// type XX = X extends (a: number, b: infer B) => any ? B : never;         // never*
// type XX = X extends (a: number, b: infer B) => null ? B : never;        // never
// type XX = X extends (a: number, b: infer B) => boolean ? B : never;     // never**
// type XX = X extends (a: number, b: infer B) => any ? B : never;     // never**
// type XX = X extends (a: number, b: infer B extends boolean) => any ? B : never;     // boolean
// type XX = X extends (a: number, b: infer B extends boolean) => boolean ? B : never;  // boolean
// type XX = X extends (a: number, b: infer B extends number) => boolean ? B : never;  // never

// type FunctionOverloads<F> = F extends Function ? _FunctionOverloads<F> : never;

// type _FunctionOverloads<F extends Function> = F extends {
//     (...args: infer Args): infer Return,
// } & infer K extends Function ?
//     [[Args, Return], ..._FunctionOverloads<K>]
// : never;
// type k = x extends {
//     (...args: infer Args): infer R
// } ? [ R] : never;

// type OverloadToUnion<T> =
// T extends (...args: infer A) => infer R
// ? (...args: A) => R
// : never;

// type z = OverloadToUnion<y>;

// export type SignatureOf<T extends (...args: any[]) => any> = (
//   ...args: Parameters<T>
// ) => ReturnType<T>;

// function f(arg: number): number;
// function f(arg: any): number | undefined {
//   return arg;
// }
// type vv = SignatureOf<typeof f>;


type Z = {
  // (...args: [string, boolean, number] | [string, boolean, string]): number,
  (a: string, b: boolean, c: number): number,
  (a: string, b: boolean, c: string): number,
  // (...args: [null, number, undefined] | [null, null, null]): symbol,
  (a: null, b: number, c: undefined): symbol,
  (a: null, b: null, c: null): symbol,
}

// type ZZ = Z extends (a: string, b: infer B, c: infer C) => number ? [B,C] : never; // never**
// type ZZ = Z extends (a: string, b: infer B extends boolean, c: infer C) => number ? [B,C] : never; // never**
// type ZZ = Z extends (a: string, b: infer B extends boolean, c: infer C) => any ? [B,C] : never; // never**
// type ZZ = Z extends (a: string, b: infer B extends boolean, c: infer C extends number) => number ? [B,C] : never; // [boolean, number]
// type ZZ = Z extends (a: infer A extends string, b: infer B, c: infer C) => any ? [B,C] : never; // never**
// type ZZ = Z extends (a: infer A extends string, b: boolean, c: infer C) => any ? C : never; // never**
// type ZZ = Z extends (a: string, b: boolean, c: infer C extends number | string) => any ? C : never; // never**

export type CommonKeyOf<A,B> = keyof A & keyof B;
export type UncommonKeyOf<A,B> = Exclude<keyof A | keyof B, keyof A & keyof B>

// export type ConflictingPropertyOf<A,B,K extends CommonKeyOf<A,B> = CommonKeyOf<A,B>> = {[P in K]: (
//   IsEquivalentType<A[P], B[P]> extends true ? never : A[P] | B[P]
// )}

export type ConflictingKeyOf<A,B,K extends keyof A & keyof B = keyof A & keyof B> = IsEquivalentType<A[K],B[K]> extends true ? never : K;
export type ConflictingPropsOf<A,B,K extends CommonKeyOf<A,B> = CommonKeyOf<A,B>> = {[P in ConflictingKeyOf<A,B,K>]: A[P] | B[P]}
export type ConflictingValueOf<A,B,K extends keyof A & keyof B = keyof A & keyof B> = ValueOf<ConflictingPropsOf<A,B,K>>


export type IncompatibleKeyOf<A,B,K extends CommonKeyOf<A,B> = CommonKeyOf<A,B>> = IsEquivalentType<A[K],B[K]> extends true ? never : (
  (Or<IsExtensionOf<never, A[K]>,IsExtensionOf<never, B[K]>> extends true ? K : (
    never extends A[K] & B[K] ? K : never
  ))
);
export type IncompatiblePropsOf<A,B,K extends CommonKeyOf<A,B> = CommonKeyOf<A,B>> = {[P in IncompatibleKeyOf<A,B,K>]: [A[P], B[P]]}
export type IncompatibleValueOf<A,B,K extends CommonKeyOf<A,B> = CommonKeyOf<A,B>> = ValueOf<IncompatiblePropsOf<A,B,K>>


export type IsEmptyObject<T> = {} extends T ? true : false;

type HasSameKeys<A,B> = never extends Exclude<keyof A, keyof B> ? true : false; // IsEmptyObject<Omit<A, keyof B>>

export type UnAnd<A,B> = A extends B & infer C extends Exclude<A,B> ? C : (
  A extends B & infer C ? C : A
);

export type UnOr<A,B> = Exclude<A,UnAnd<A,B>>

// type UnOr<A,B> = And<IsExtensionOf<A, object>, IsExtensionOf<B,object>> extends true ? (
//   (IsEmptyObject<Omit<A, keyof B>> extends true ? never : Omit<A, keyof B>)
//   // &
//   // (
//   //   {[P in CommonKeyOf<A,B>]: Exclude<A[P], B[P]>}
//   // )
//  ) : Exclude<A,B>

// type t1 = {a: string, b: boolean, c: object}
// type t2 = {a: number, d: string, e: null}
// // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
// type t3 = {b: undefined, c: Function, e: number}

// type t12 = t1 | t2


// type tt = t12['a']

// type _ =  UnAnd<t1 & (t2 | t3), t2 | t3>

// type x = Text extends Element ? true : false;


type ElementConstructor<T, S extends string = string> = React.JSXElementConstructor<T> | S;

type ReactHTMLElement<E extends HTMLElement | React.HTMLElementType, 
  // T extends (E extends React.HTMLElementType ? E : React.HTMLElementType) | React.JSXElementConstructor<any> = (E extends React.HTMLElementType ? E : React.HTMLElementType) | React.JSXElementConstructor<any>> 
  T extends React.HTMLElementType | React.JSXElementConstructor<any> = (E extends React.HTMLElementType ? E : React.HTMLElementType | React.JSXElementConstructor<any>)> 
  = React.ReactElement<React.HTMLAttributes<E>, T>;
type ReactHTMLElement2<E extends HTMLElement | React.HTMLElementType, 
  T extends React.HTMLElementType | React.JSXElementConstructor<any> = (E extends React.HTMLElementType ? E : React.HTMLElementType | React.JSXElementConstructor<any>)> 
  = React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<E>, E>, T>;

type DetailedReactHTMLElement<T extends HTMLElement, P extends React.HTMLAttributes<T> = React.HTMLAttributes<T>>
  = React.DetailedReactHTMLElement<P, T>;
type DetailedReactHTMLElement2<T extends HTMLElement, P extends React.DetailedHTMLProps<React.HTMLAttributes<T>, T> = React.DetailedHTMLProps<React.HTMLAttributes<T>, T>>
  = React.DetailedReactHTMLElement<P, T>;

type ReactHTMLElemFromDetailedProps<T extends React.HTMLElementType, S extends T | React.JSXElementConstructor<ReactHTMLElement<T>> = T> = React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<T>, T>, S>
type ReactHTMLElemFromComponentProps<T extends React.HTMLElementType>
  = React.ReactElement<React.ComponentProps<T>, T>;

type TT = {
  z: React.ReactHTMLElement<HTMLDivElement>,

  a1: ReactHTMLElement<HTMLDivElement, 'div'>, // React.ReactElement<React.HTMLAttributes<HTMLDivElement>, "div">;
  a2: ReactHTMLElement2<HTMLDivElement, 'div'>, // React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "div">;
  
  b1: ReactHTMLElement<'div'>, // React.ReactElement<React.HTMLAttributes<"div">, "div">
  b2: ReactHTMLElement2<'div'>, // React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<"div">, "div">, "div">
  
  
  c1: DetailedReactHTMLElement<HTMLDivElement>, // React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  c2: DetailedReactHTMLElement2<HTMLDivElement>, // React.DetailedReactHTMLElement<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, HTMLDivElement>
  
  d1: ReactHTMLElemFromDetailedProps<'div'>, // React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<"div">, "div">, "div">
  
  e1: ReactHTMLElemFromComponentProps<'div'>, // React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "div">
}



// type TT0 = React.ReactHTMLElement<HTMLDivElement> | React.ReactHTMLElement<any>;
// type TT1 = TT['z'] | TT['a1'] | TT['a2'] | TT['b1'] | TT['b2'] | TT['c1'] | TT['c2'] | TT['d1'] | TT['e1']

// type xx = React.HTMLAttributes<Text>;

// | 
// type Overlap = React.ReactElement<React.HTMLAttributes<Text>> | React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> | React.ReactElement<React.ComponentProps<'span'>, 'span'> | React.ReactElement<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'span'>;

// function TTF(): TT['z'] | TT['a1'] | TT['a2'] | TT['b1'] | TT['b2'] | TT['c1'] | TT['c2'] | TT['d1'] | TT['e1'] {
  
// }