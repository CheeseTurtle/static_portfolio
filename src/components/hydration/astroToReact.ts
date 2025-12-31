// Dehydrated.tsx

import type { ValueOf } from "node_modules/astro/dist/type-utils";
import React from "react";




// Helper to check if something is Astro JSX
export function isAstroJSX(value: any): value is AstroJSX {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return !!value && typeof value === 'object' && value['astro:jsx'] === true;
}

interface AstroJSX {
    'astro:jsx': true;
    type: string | React.ComponentType;
    props: Record<string, any>;
}


type _AstroJSX = {
    'astro:jsx': true
}



function omitOwner<T extends object>(x: T): Omit<T, '_owner' | '_store' | '_stack' | 'stack' | 'store' | 'owner'> {
    const {_owner, _store, _stack, store, owner, stack, ...rest} = x as T & {_owner: object, _store: object, _stack?: object, stack?: object, owner?: object, store?: object, parent?: object};
    return rest;
}

function omitOwnerFromChildren(x: any): any {
    if(typeof x !== 'object') return x;
    if(React.isValidElement(x))
        return omitOwner(x);
    if(Symbol.iterator in x) {
        return Array.from(x).map(omitOwnerFromChildren);
    }
    return x;
}




type AwaitedSingleReactNode = Awaited<Exclude<React.ReactNode, Iterable<any> | Promise<any>> | string>
type SingleReactNode = Exclude<React.ReactNode, Iterable<any> | Promise<React.ReactNode>> | string | Promise<AwaitedSingleReactNode>


// Convert Astro JSX to React elements
export function astroJSXToReact(node: AstroJSX, key?: string): React.ReactElement {
    
    const { type, props } = node;
    const { children, ...restProps } = props || {};
    
    // Recursively convert children
    const convertedChildren = children ? transformAstroChildren(children) : children as React.ReactNode;
    
    const reactElem = React.createElement(type, 
        (undefined === key || null === key ? restProps : {key, ...restProps}),
        convertedChildren);

    console.log('Converting AstroJSX to React:', omitOwner(node), omitOwner(reactElem));
    return reactElem;
}


function isNilValue<T extends NonNullable<any>>(x: null | undefined | T): x is null | undefined {
    return undefined === x || null === x;
}
function isNonNilValue<T extends NonNullable<any>>(x: null | undefined | T): x is T {
    return !(undefined === x || null === x);
}

function ensureReact(x: AstroJSX, index?: number): React.ReactElement;
function ensureReact<T extends NoInfer<SingleReactNode>>(x: NoInfer<T>, index?: number): T;
// function ensureReact<T extends NoInfer<null | undefined>>(x: NoInfer<T>): T;
function ensureReact(x: any, index?: number): SingleReactNode;
function ensureReact(x: any, index?: number): SingleReactNode {
    if(!x) return x as SingleReactNode;
    if(x instanceof Promise)
        return x.then(result=>ensureReact(result, index))
    const ret = isAstroJSX(x) ? astroJSXToReact(x, undefined === index ? undefined : `.$${index}`) : x as SingleReactNode;
    if(React.isValidElement(ret) && ret.props) {
        // @ts-expect-error Untyped children
        const {children, ...props} = ret.props;
        if(children)
            return React.cloneElement(ret, props, transformAstroChildren(children));
        // if(children)
        //     return React.cloneElement(ret, (undefined === index || !isNilValue(ret.key) ? props : {key: `.$${index}`, ...props}), transformAstroChildren(children));
        // if(undefined !== index && isNilValue(ret.key))
        //     return React.cloneElement(ret, {key: `.${index}`, ...props});
    }
    return ret;
}


export function transformAstroChildren(children: any, index?: number): React.ReactNode {
    if (Array.isArray(children)) {
        return children.map(transformAstroChildren);
    } else if(typeof children === 'object' && Symbol.iterator in children) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return Array.from(children).map(transformAstroChildren)
    }

    // Single child
    return ensureReact(children, index);
}

// Transform props that contain Astro JSX
export function transformPropsWithAstroJSX<P>(props: P): P {
    if (!props || typeof props !== 'object') return props;
    
    const transformed: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(props))
        transformed[key] = transformAstroChildren(value);
    
    return transformed as P;
}
type TransformedProps<P> = P extends object ? (
    {[K in keyof P]: (
        P[K] extends _AstroJSX ? React.ReactElement<any> : P[K]
    )}
) : P;


export function transformAstroProps<P extends Record<string, any> | undefined>(props: P): TransformedProps<P> {
    if(!props || typeof props !== 'object') return props as TransformedProps<P>;
    const transformed: Record<string, any> = {};
    for (const [key, value] of Object.entries(props))
        transformed[key] = (isAstroJSX(value) ? astroJSXToReact(value) : value as ValueOf<P>);
    return transformed as TransformedProps<P>;
}