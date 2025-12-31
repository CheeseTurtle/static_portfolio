'use client';

import type { EntryOf } from "@/lib/type-utils";
import type { ValueOf } from "node_modules/astro/dist/type-utils";
import React from "react";
import { astroJSXToReact, isAstroJSX, transformAstroChildren } from "./astroToReact";
import { transformTreeConditionally } from "../projects/details/transformTree";
import { getImportWithLoaderMap, type HydrationContextValue, type LoaderMap, type LoaderMapP, type LoaderMapT } from "./hydrationContext";



type PropDivProps<K extends string, T extends React.ReactNode> = {
    key: K,
    'data-react-prop-key': K,
    children: T
}
type PropFragment<K extends string, T extends React.ReactNode> = React.ExoticComponent<PropDivProps<K,T>>
type PropFragmentElement<K extends string, T extends React.ReactNode> = React.ReactElement<PropDivProps<K,T>, PropFragment<K,T>>;


// function f(x: PropFragment<any, any>) {
//     const x = <React.Fragment></React.Fragment>
// }


type PropsFromFragmentRecord<P extends Record<string, React.ReactNode>> = P extends Record<infer Keys extends string, any> ? {[K in Keys]: PropFragmentElement<K,P[K]>} : never;

type FragmentsFromProps<P extends Record<string, React.ReactNode>> = ValueOf<PropsFromFragmentRecord<P>>


// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PropFromFragment<F extends PropFragmentElement<any,any>> = F extends PropFragmentElement<infer Keys, any> ? {[K in Keys]: F extends PropFragmentElement<K, infer V> ? V : never} : never;
type PropsFromFragments<F extends PropFragmentElement<any, any> | Iterable<PropFragmentElement<any, any>>> = (
    (F extends Iterable<any> ? (
        F extends Iterable<PropFragmentElement<infer K, infer V>> ? Record<K, V> : never
    ) : never) 
    |
    (
        F extends PropFragmentElement<infer K, infer V> 
        ? Record<K, V> : never
    )
)


type KeysWithReactNodeValuesOnly<P, K extends keyof P = keyof P> = K extends keyof P ? P[K] extends React.ReactNode? K : never : never;
type KeysWithReactNodeValues<P, K extends keyof P = keyof P> = K extends keyof P ? Extract<P[K], React.ReactNode> extends never ? never : K : never;
type KeysWithNonReactNodeValues<P, K extends keyof P = keyof P> = K extends keyof P ? Exclude<P[K], React.ReactNode> extends never ? never : K : never;
type KeysWithoutReactNodeValues<P, K extends keyof P = keyof P> = K extends keyof P ? P[K] extends React.ReactNode ? never : K : never;

type KeysWithMixedValues<P, K extends keyof P = keyof P> = KeysWithReactNodeValues<P, KeysWithNonReactNodeValues<P, K>> | KeysWithNonReactNodeValues<P, KeysWithReactNodeValues<P, K>>;

// type xxx = KeysWithMixedValues<{
//     a: React.ReactNode,
//     b: number,
//     c: string | void | React.ReactNode,
//     d: ()=>void,
// }>



// A
// ======
// keys with non-react node values
// optionally, keys with mixed values (exclude react node)

// children
// ======
// keys with react node values
// optionally, keys with mixed values (extract react node)


// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PreSplitProps<P extends A & Record<Keys, React.ReactNode> & Partial<Record<OptionalKeys, React.ReactNode>>, Keys extends string, OptionalKeys extends string = never, A extends Record<any,any> = Omit<P, Keys | OptionalKeys | 'children'>> = (
    {children: FragmentsFromProps<{[K in OptionalKeys]: P[K]}> | FragmentsFromProps<{[K in Keys]: P[K]}>} & Omit<A, 'children'>
)


// type SplitProps<P extends A & {children: FragmentsFromProps<any>}, A extends Record<Exclude<string, 'children'>, Exclude<any, React.ReactNode>>>


type PickWithoutReactNodeValues<P> = Pick<P, KeysWithoutReactNodeValues<P>>

type PickWithReactNodeValues<P> = Pick<P, KeysWithReactNodeValuesOnly<P>>
type ChildrenFromReactNodeValuesOnly<P> = PickWithReactNodeValues<P> extends Record<string, React.ReactNode> ? FragmentsFromProps<PickWithReactNodeValues<P>> : never;


type PickWithMixedValues<P> = Pick<P, KeysWithMixedValues<P>>
type ChildrenFromMixedValues<P> = PickWithMixedValues<P> extends Record<string, React.ReactNode> ? FragmentsFromProps<{[K in keyof PickWithMixedValues<P>]: Extract<PickWithMixedValues<P>[K], React.ReactNode>}>: never;
type PropsFromMixedValues<P> = {[K in keyof PickWithMixedValues<P>]: Exclude<PickWithMixedValues<P>[K], React.ReactNode>}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PropsForChildrenFromMixedValues<P> = PickWithMixedValues<P> extends Record<string, React.ReactNode> ? {[K in keyof PickWithMixedValues<P>]: Extract<PickWithMixedValues<P>[K], React.ReactNode>} : never;

export type SplitProps<P> = Omit<PickWithoutReactNodeValues<P> & Partial<PropsFromMixedValues<P>>, 'children'> & {children: ChildrenFromReactNodeValuesOnly<P> | ChildrenFromMixedValues<P>}


export function splitProps<P extends object>(props: P) {
    // console.log('Splitting transformed props:', props)
    const childProps: Record<string, React.ReactElement | Array<React.ReactElement> | React.ReactNode> = {};
    const filteredEntries = Object.entries(props).filter(([k,v])=>{
        if(k === 'children') {
            if(undefined === v) return false;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            childProps['children'] = typeof v === 'object' ? transformAstroChildren(v) : v;
            return false;
        }
        if(!v) return true;
        if(isAstroJSX(v)) {
            childProps[k] = astroJSXToReact(v);
            return false;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        } else if(React.isValidElement(v)) {
            childProps[k] = v;
            return false;
        } else if(Symbol.iterator in v) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const arr = Array.from(v);
            if(arr.every(x=>(typeof x !== 'function' && typeof x !== 'object' && typeof x !== 'symbol' && typeof x !== 'boolean') || React.isValidElement(x) || isAstroJSX(x))) {
                childProps[k] = transformAstroChildren(arr) as Array<React.ReactElement>;
                return false;
            }
        }
        return true;
    });
    // PickWithReactNodeValues<P> & Partial<PropsForChildrenFromMixedValues<P>>

    const children = Object.entries(childProps).map(([k,v])=>{
        return React.createElement('template', {key: k, 'data-react-prop-key': k}, v)
    })

    // console.log('New entries:', filteredEntries)
    // console.log('New children:', children);

    // return Object.assign(Object.fromEntries(filteredEntries), {children}) as unknown as SplitProps<P>;
    return [Object.fromEntries(filteredEntries), children] as unknown as [Omit<SplitProps<P>, 'children'>, SplitProps<P>['children']];
}



function fragmentsToEntries<P>(children: ChildrenFromReactNodeValuesOnly<P> | ChildrenFromMixedValues<P>) { // : (EntryOf<PropsFromFragments<typeof children>>)[] {
    if(Symbol.iterator in children) {
        const arr = Array.from(children as Iterable<PropFragmentElement<any, any>>).map(
            child=>[child.props['data-react-prop-key'], child.props.children]
        ) as (EntryOf<PropsFromFragments<typeof children>>)[]
        return arr;
    } else if(children) {
        return [[children.props['data-react-prop-key'], children.props.children]];
    }
    return [];
}
export function reassembleProps<P>(
    hydrationId: string,
    {children, 'data-react-key': keyProp, ...props}: Omit<SplitProps<P>, 'children'> & {children?: SplitProps<P>['children'], 'data-react-key'?: React.Key | null | undefined},
) {
    const key = keyProp ?? `.hyd-${hydrationId}`;
    console.log(`Reassembling props (keyProp: ${key}):`, children, props)
    const entries = children === null || undefined === children ? [] : fragmentsToEntries(children);
    const assembledProps = Object.fromEntries(entries) as Partial<PropsFromFragments<Exclude<typeof children, undefined>>>;
    return {...assembledProps, key, ...props}  as P
}



type GetImport = HydrationContextValue['getImport'];



export type DehydratedElemProps<P, T extends React.ComponentType<P> = React.ComponentType<P>> = {
    'data-import-path': string,
    'data-hydration': 'dehydrated',
    'data-hydrate-recurse': boolean | 'true' | 'false',
    'data-react-key'?: React.Key | null | undefined,
    'data-hydration-role': 'template' | 'placeholder',
    'data-hydration-id': ReturnType<typeof React.useId>,
    // __clientComponent: React.ComponentType<React.Component<P>>,
} & React.ComponentProps<T>;


export function hydrateNode<P extends DehydratedElemProps<SplitProps<any>>>(getImport: GetImport, node: React.ReactElement<any,any>): [result: React.ReactElement, recurse: boolean] {
    if(node && typeof node === 'object' && React.isValidElement(node)) {
        // @ts-expect-error Untyped children
        const children = node.props?.children as React.ReactNode;
        // const importPath = (node.props?.['data-hydration-import-path'] || node.props?.dataHydrationImportPath);
        // if(importPath) return true;
        const props = node.props as P | undefined;
        if(!props) return [node, false];
        if(!Object.hasOwn(props, 'data-hydration-role')) return [node, true];
        const {"data-hydration-role": hydrationRole, "data-hydration-id": hydrationId, "data-import-path": importPath, "data-hydrate-recurse": hydrateRecurse, "data-hydration": hydration, ...props_} = props;

        if(hydrationRole === 'placeholder') return [node, false]; // TODO: Check if actually replaced?

        

        console.log('ATTEMPTING TO HYDRATE NODE:', node);
        // if(hydration !== 'dehydrated') return [node, true];
        if(!importPath) {
            console.error('Missing import path for node:', node);
            return [node, false];
        }
        const __clientComponent = getImport(importPath);
        console.log('GOT CLIENT COMPONENT:', node, __clientComponent);

        const unsplit = reassembleProps(hydrationId, props_); // Includes children
        console.log('Should transform node?', node, props_, unsplit);
        // @ts-expect-error Untyped children
        const {children: newChildren, ...unsplit_} = unsplit;
        console.log('NODE CHILDREN:', children, newChildren)
        type PP = P extends DehydratedElemProps<SplitProps<infer PP>> ? PP : never;
        if(__clientComponent) {
            console.log('CREATING ELEMENT:', __clientComponent, unsplit_, newChildren);
            const component = React.createElement(__clientComponent, unsplit_ as PP, newChildren as React.ReactNode);
            console.log('RETURNING ELEMENT:', component);
            // component.key = key;
            return [component, hydrateRecurse === "true" || hydrateRecurse === true];
            // return [<__clientComponent {...unsplit as PP}></__clientComponent>, hydrateRecurse === "true" || hydrateRecurse === true || false];
        }        
    }
    return [node, false];
}


export function hydrate(getImport: GetImport, node: React.ReactNode) {
    return transformTreeConditionally(node, (x: React.ReactElement)=>hydrateNode(getImport, x));
}


// function isNodeWithKey<T extends React.ReactNode>(node: T): node is Extract<T, {key: React.Key}> {
//     if(!node || typeof node !== 'object') return false;
//     if(!React.isValidElement(node)) return false;
//     return !(undefined === node.key || null === node.key);
// }

export function hydrateWithLoaderMap(loaderMap: LoaderMap<any,any>, node: React.ReactNode, ensureKey?: [React.Key | undefined | null]): React.ReactNode {
    const getImport = (path: Extract<keyof typeof loaderMap, string>) => getImportWithLoaderMap<LoaderMapP<typeof loaderMap>, LoaderMapT<typeof loaderMap>, typeof loaderMap>(loaderMap, path)
    // console.log('Hydrating with loader map:', node);
    const ret = transformTreeConditionally(node, (x: React.ReactElement)=>hydrateNode(getImport, x), ensureKey?.[0])
    // console.log('Returning:', ret, ensureKey)
    // if(!ensureKey) return ret;
    // const [key] = ensureKey;
    // if(!React.isValidElement(ret)) {
    //     if(key === undefined || key === null) return ret;
    //     return React.createElement('span', {key}, ret);
    // }
    // if(undefined === ret.key || null === ret.key) {
    //     return React.cloneElement(ret, Object.assign(ret.props || {}, {key}));
    // }
    return ret;
}
