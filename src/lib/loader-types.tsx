import React from 'react';
// import type { IsEquivalentType, UnpackTypeUnion } from './type-utils';
export type LoaderFromProps<P> = () => Promise<{default: React.ComponentType<P>;}>
export type Loader<T extends React.ComponentType<any>> = () => Promise<{default: T;}>

export type AttrsOfComponentType<T extends React.ComponentType<any>> = (T extends React.ComponentType<infer P> ? P : never);
export type AttrsOfLoaderType<T extends Loader<any>> = T extends Loader<React.ComponentType<infer P>> ? P : never;
export type ComponentTypeOfLoaderType<T extends Loader<any>> = T extends Loader<infer C> ? C : never;




export type ElementOfLoader<L extends Loader<any>> = L extends Loader<infer T> ? ElementOfComponentType<T> : never;
export type ElementTypeOfLoader<L extends Loader<any>> = ElementOfLoader<L> extends React.ReactElement<any, infer T> ? T : never;





export type ComponentOfComponentType<T extends React.ComponentType<any>> = T extends React.FunctionComponent<infer P> ? React.Component<P> : (
    T extends React.ComponentClass<infer P, infer S> ? React.Component<P,S> : never
);

export type ComponentClassOfComponent<T extends React.Component<any>> = T extends React.Component<infer P, infer S> ? React.ComponentClass<P,S> : never;
export type FunctionComponentOfComponent<T extends React.Component<any>> = T extends React.Component<infer P> ? React.FunctionComponent<P> : never;
export type ComponentTypeOfComponent<T extends React.Component<any>> = T extends React.Component<infer P, infer S> ? React.ComponentClass<P,S> | (
    never extends keyof S ? React.FunctionComponent<P> : never
) : never;



export type ElementOfComponentType<T extends React.ComponentType<any>> = T extends React.ComponentType<infer P> ? React.ReactElement<P, T> : never;


type HTMLElem<S extends HTMLElement | React.HTMLElementType> = S extends HTMLElement ? S : (
    S extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[S] : HTMLElement
)




// type Test<X> = X extends React.DetailedHTMLProps<any, infer T> ? (
// ) : never;

// type xx = {[K in keyof React.JSX.IntrinsicElements]: Test<React.JSX.IntrinsicElements<K>>};

// // type z = React.HTMLAttributes | React.HTMLProps | React.DetailedHTMLProps | React.HtmlHTMLAttributes
// type x = React.ComponentProps<'code'> | React.JSX.



type IntrinsicElementType = keyof React.JSX.IntrinsicElements;

// type SVGElementType = (
//     (
//         {[K in Extract<keyof React.JSX.IntrinsicElements, React.HTMLElementType>]: React.JSX.IntrinsicElements[K] extends React.SVGProps<infer T extends SVGElement> ? T : never }
//     ) extends infer O ? {[K in (never extends O[keyof O] ? never : keyof O)]: O[K]} : never
// )


type HTMLPropsFromString<S extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[S];
type HTMLAttributesFromString<S extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[S] extends React.DetailedHTMLProps<infer A, any> ? A : never;

// type zzz = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> // React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>

// type xxx = React.ComponentProps<'div'> // React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>


// function ff(x: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>  | React.ComponentPropsWithRef<'div'>) {

// }


// function fff<P extends React.HTMLAttributes<T>,T extends React.JSXElementConstructor<P> | string>(el: React.ReactElement<React.DetailedHTMLProps<P,T>,T>): typeof el {
//     return el;
// }


// React.ClassType
// React.ComponentClass
// React.FunctionComponent

// const kk = React.createElement(null as unknown as React.FunctionComponent<{}>, )

// const k = fff<any,'div'>(<div/>);

type HTMLElementFromString<S extends React.HTMLElementType> = HTMLAttributesFromString<S>;

type ReactHTMLElem<T extends HTMLElement, P extends React.HTMLAttributes<T> = React.HTMLAttributes<T>> = React.DetailedReactHTMLElement<P, T>;

// type ReactHTMLElementFromString<S extends React.HTMLElementType> = React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElementFromString<S>>, HTMLElementFromString<S>>



// type ComponentTypeOfString<S extends string, Fallback extends React.ComponentType = any> = (
//     S extends React.HTMLElementType ? (
//         React.ReactHTMLElement<React.JSX.IntrinsicElements[S]>

//     ) : React.ReactElement<any, S>
// )

export type ComponentTypeOfElement<E extends React.ReactElement<any,any>> = E extends React.ReactElement<infer P, infer T> ? (
    T extends string ? React.ComponentType<P> : T
 ) : never;
// export type ComponentOfElement<E extends React.ReactElement<any,any>> = E extends React.ReactElement<infer P, infer T> ? (
//     T extends string ? 


// )


export type ComponentInstanceTypeOf<T extends React.ComponentType<any>> = (
    T extends React.FC<any> ? ReturnType<T> : (
        (T extends React.ComponentClass<infer P, infer S> ? React.Component<P,S> | React.PureComponent<P,S> : never)
    )
)



export interface FunctionComponent<P,C extends React.JSXElementConstructor<any> | string = React.JSXElementConstructor<any> | string, T extends React.ReactNode = React.ReactElement<P, C>> extends React.FunctionComponent<P> {
    (props: P): T | Promise<T>;
}

// type FunctionComponent2<T extends React.Component> = {

// }

// type z = FunctionComponent2<React.Component<typeof React.Suspense>>

// type X<P> = ReturnType<FunctionComponent<P>>

// function f<T extends React.FunctionComponent<any>>(Comp: T, props: AttrsOfComponentType<T>): ComponentInstanceTypeOf<T> {
//     // const x = new React.Component<P,{abc: string, def: number},{test: ()=> void}>(props, {
//     //     abc: '123'
//     // });
//     return <Comp {...props}></Comp>;
// }

