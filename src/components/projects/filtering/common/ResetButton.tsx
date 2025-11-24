import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCcwIcon, LucideRotateCcw } from "lucide-react";
import type { Key } from "react";
import type React from "react";


type ButtonProps = React.ComponentPropsWithRef<typeof Button>;



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


type DualExclude<T1,T2> = Exclude<T1,T2> | Exclude<T2,T1>;

type DualExtract<T1,T2> = Extract<T1,T2> | Extract<T2,T1>;

// type x = IsEquivalentType<GeneralizeKeyTypes<ButtonProps>, keyof ButtonProps>;


// type OmitTyped<T, K extends Key, V> = T extends any ? (
//     // T extends {[P in infer KT extends K]: infer VT extends V} ?
//     Extract<K, keyof T> extends infer MatchingKeys extends keyof T ? (
//     {[Key in MatchingKeys]: (T[Key] extends V ? Key : never)}
//     ) : never
// ) : T;

type OmitTyped<T, K extends keyof T, V> = T extends any ? (
    {[P in keyof T]: P extends K ? Exclude<T[P], V> : T[P]}
) : T;

// type x = OmitTyped<ButtonProps, "children", string | number>['children'];


type ExtractValueType<T, Key extends keyof T, Never = never> = T[Key] extends infer ValueType ? ValueType : Never;


type VariantType = ExtractValueType<ButtonProps, "variant">;
type SizeType = ExtractValueType<ButtonProps, "size">;

export interface ResetButtonProps extends Omit<ButtonProps, "children"> {
    children?: string | undefined | null,
    // variant?: VariantType,
    // size?: SizeType
}

const ResetButton = ({children, variant = "ghost", size="default", ...props}: ResetButtonProps) => {
    const label = children || undefined;
    return <Button variant={variant} size={size} {...props} aria-label={label} title={label}
            // className="absolute -left-12 top-1/2 -translate-y-1/2 h-auto py-1 px-2 text-xs"
    >
        <RotateCcw size={2}></RotateCcw>
    </Button>
};

export default ResetButton;