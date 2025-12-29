import { useIsClient } from '@/hooks/use-is-client';
import React from 'react';
// import { useHydrationContext } from './HydrationContext';
import { transformAstroProps, transformPropsWithAstroJSX } from './astroToReact';
import { splitProps } from './hydrate';
import { useHydrationContext } from './hydrationContext';

type _DehydratedProps = {
    // keyProp: string,
    importPath: string,
    Placeholder?: React.HTMLElementType,
    children?: React.ReactNode,
    hydrateRecurse?: boolean,
    fallback?: false | React.ReactNode,
} & React.Attributes

type DehydratedProps<P> = _DehydratedProps & {
    // Component: React.ComponentType<P> | React.LazyExoticComponent<React.ComponentType<P>>,
    
} & P;




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




// type ElementType<P = any, Tag extends keyof React.JSX.IntrinsicElements = keyof React.JSX.IntrinsicElements> = { [K in Tag]: P extends React.JSX.IntrinsicElements[K] ? K : never; }[Tag] | React.ComponentType<P>
// type ElemTypeTag<P> = keyof React.JSX.IntrinsicElements | React.ComponentType<P>
export function Dehydrated<P extends object, T extends React.ComponentType<P> = React.ComponentType<P>/*T extends React.ElementType<P, C> = React.ElementType<P,any>, C extends keyof React.JSX.IntrinsicElements = never*/>(
    {key, importPath, Placeholder='div', children, fallback = false, hydrateRecurse=false, ...props}: DehydratedProps<P>) {
    const isClient = useIsClient()

    const id = React.useId();
    // if(!isClient) return <Placeholder data-hydration-import-path={importPath} {...props}>{children}</Placeholder>;
    // typeof fallback === 'function' ? fallback?.(props) : fallback

    const log = React.useCallback(function <T>(x: T) {
        // @ts-expect-error TODO
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(`Dehydrated (key: ${key}) returning:`, omitOwner(x), omitOwnerFromChildren(x.props.children));
        return x;
    }, [])


    
    // const value = useHydrationContext();
    // const Component = value.getImport<P,T>(importPath)

    
    // // Render a placeholder server-side (and while dehydrated). Attach the component
    // // as a non-serializable prop so client-side transforms can read it from the node.
    // if (!isClient) {
        // console.log('Transforming astro props:', props)
        const [newProps, newChildren] = splitProps(transformAstroProps({...props, children}));

        // @ts-expect-error TODO
        const dehydratedProps: DehydratedElemProps<P,T> =  { 'data-react-key': key, 'data-hydration-role': 'template', 'data-hydration-id': id, 'data-hydration': 'dehydrated', 'data-hydrate-recurse': hydrateRecurse, 'data-import-path': importPath, ...(newProps), children: newChildren };
        const template = React.createElement('template', dehydratedProps, newChildren);
        // const placeholder = React.createElement(Placeholder, {'data-hydration-id': id, 'data-hydration-role': 'placeholder'})
        // return log(React.createElement(Placeholder, {...dehydratedProps}, template));
        return template;
        // return React.createElement(React.Fragment, {key},
        //     template,
        //     // placeholder,
        // )
    // }


    // // On client, if a Component was passed, render it (supports React.lazy).
    // if (Component) {
    //     // const component = <Component {...(props as React.ComponentProps<T>)}></Component>;
    //     // const component = React.createElement(Component as ComponentType<any>, props, children);
    //      // Transform Astro JSX in props to React elements
    //     const transformedProps = transformPropsWithAstroJSX(props as P);
        
    //     // Type assertion to handle LazyExoticComponent or regular components
    //     const component = React.createElement(
    //         Component as React.ComponentType<any>, 
    //         { ...transformedProps } as any,
    //         children,
    //     );
    //     if(fallback === false)
    //         return log(component);
    //     return log(<React.Suspense fallback={fallback}>
    //         {component}
    //     </React.Suspense>);
    // }

    // fallback: just render children or do import-path based hydrating if you still use it
    // return log(React.createElement(Placeholder, {key, 'data-react-key': key, ...transformAstroProps(props), children}, children));
    // const Component = React.useMemo(()=>getImport<T>(importPath), [importPath]);
    // return <Component {...props}>{children}</Component>;
}