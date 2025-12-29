// import { useIsClient } from '@/hooks/use-is-client';
// import React from 'react';
// // import { useHydrationContext } from './HydrationContext';
// import { astroJSXToReact, isAstroJSX, transformAstroChildren, transformAstroProps } from './astroToReact';
// import type { ValueOf } from 'node_modules/astro/dist/type-utils';
// import type { EntryOf } from '@/lib/type-utils';

// // // type PreElement = React.ReactHTMLElement<HTMLPreElement>; //
// // type PreElement =  React.ReactElement<React.HTMLAttributes<HTMLPreElement>, 'pre'>;


// // function TestComponent(props: {a: number, b?: string}): React.ReactNode {
// //     return null;
// // }

// // type X = Loader<typeof TestComponent>;


// type _DehydratedProps = {
//     keyProp?: string,
//     importPath: string,
//     Placeholder?: React.HTMLElementType,
//     children?: React.ReactNode,
//     hydrateRecurse?: boolean,
//     fallback?: false | React.ReactNode,
// } & React.Attributes

// type DehydratedProps<P> = _DehydratedProps & {
//     // Component: React.ComponentType<P> | React.LazyExoticComponent<React.ComponentType<P>>,
    
// } & P;


// export type DehydratedElemProps<P, T extends React.ComponentType<P> = React.ComponentType<P>> = {
//     'data-import-path': string,
//     'data-hydration': 'dehydrated',
//     'data-hydrate-recurse': boolean | 'true' | 'false',
//     // __clientComponent: React.ComponentType<React.Component<P>>,
// } & React.ComponentProps<T>;


// // export const imports: Record<string, React.FC<any>> = {}

// // export const promises: Record<string, Promise<React.FC<any>>> = {}

// // export function getImport<T>(path: string) {
// //     // if(imports[path]) return imports[path] as React.ComponentType<T>;
// //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// //     const promise: Promise<React.FC<T>> = promises[path] ??= import(path).then(x=>{
// //         console.log('IMPORT RESULT:', x);
// //         return (imports[path] ??= x as React.FC<T>);
// //     });
    
// //     return React.use(promise);
// // }

// // type c = React.ElementType<{key?: string, children?: React.ReactNode}>;
// // type cc = Exclude<keyof React.JSX.IntrinsicElements, React.SVGElementType | React.HTMLElementType>
// // type ccc = Pick<React.JSX.IntrinsicElements,cc>




// type PropFragmentProps<K extends string, T extends React.ReactNode> = React.FragmentProps & {
//     key: K,
//     keyProp: K,
//     children: T
// }
// type PropFragment<K extends string, T extends React.ReactNode> = React.ExoticComponent<PropFragmentProps<K,T>>
// type PropFragmentElement<K extends string, T extends React.ReactNode> = React.ReactElement<PropFragmentProps<K,T>, PropFragment<K,T>>;


// // function f(x: PropFragment<any, any>) {
// //     const x = <React.Fragment></React.Fragment>
// // }


// type PropsFromFragmentRecord<P extends Record<string, React.ReactNode>> = P extends Record<infer Keys extends string, any> ? {[K in Keys]: PropFragmentElement<K,P[K]>} : never;

// type FragmentsFromProps<P extends Record<string, React.ReactNode>> = ValueOf<PropsFromFragmentRecord<P>>


// type PropFromFragment<F extends PropFragmentElement<any,any>> = F extends PropFragmentElement<infer Keys, any> ? {[K in Keys]: F extends PropFragmentElement<K, infer V> ? V : never} : never;
// type PropsFromFragments<F extends PropFragmentElement<any, any> | Iterable<PropFragmentElement<any, any>>> = (
//     (F extends Iterable<any> ? (
//         F extends Iterable<PropFragmentElement<infer K, infer V>> ? Record<K, V> : never
//     ) : never) 
//     |
//     (
//         F extends PropFragmentElement<infer K, infer V> 
//         ? Record<K, V> : never
//     )
// )


// type KeysWithReactNodeValuesOnly<P, K extends keyof P = keyof P> = K extends keyof P ? P[K] extends React.ReactNode? K : never : never;
// type KeysWithReactNodeValues<P, K extends keyof P = keyof P> = K extends keyof P ? Extract<P[K], React.ReactNode> extends never ? never : K : never;
// type KeysWithNonReactNodeValues<P, K extends keyof P = keyof P> = K extends keyof P ? Exclude<P[K], React.ReactNode> extends never ? never : K : never;
// type KeysWithoutReactNodeValues<P, K extends keyof P = keyof P> = K extends keyof P ? P[K] extends React.ReactNode ? never : K : never;

// type KeysWithMixedValues<P, K extends keyof P = keyof P> = KeysWithReactNodeValues<P, KeysWithNonReactNodeValues<P, K>> | KeysWithNonReactNodeValues<P, KeysWithReactNodeValues<P, K>>;

// // type xxx = KeysWithMixedValues<{
// //     a: React.ReactNode,
// //     b: number,
// //     c: string | void | React.ReactNode,
// //     d: ()=>void,
// // }>



// // A
// // ======
// // keys with non-react node values
// // optionally, keys with mixed values (exclude react node)

// // children
// // ======
// // keys with react node values
// // optionally, keys with mixed values (extract react node)


// type PreSplitProps<P extends A & Record<Keys, React.ReactNode> & Partial<Record<OptionalKeys, React.ReactNode>>, Keys extends string, OptionalKeys extends string = never, A extends Record<any,any> = Omit<P, Keys | OptionalKeys | 'children'>> = (
//     {children: FragmentsFromProps<{[K in OptionalKeys]: P[K]}> | FragmentsFromProps<{[K in Keys]: P[K]}>} & Omit<A, 'children'>
// )


// // type SplitProps<P extends A & {children: FragmentsFromProps<any>}, A extends Record<Exclude<string, 'children'>, Exclude<any, React.ReactNode>>>


// type PickWithoutReactNodeValues<P> = Pick<P, KeysWithoutReactNodeValues<P>>

// type PickWithReactNodeValues<P> = Pick<P, KeysWithReactNodeValuesOnly<P>>
// type ChildrenFromReactNodeValuesOnly<P> = PickWithReactNodeValues<P> extends Record<string, React.ReactNode> ? FragmentsFromProps<PickWithReactNodeValues<P>> : never;


// type PickWithMixedValues<P> = Pick<P, KeysWithMixedValues<P>>
// type ChildrenFromMixedValues<P> = PickWithMixedValues<P> extends Record<string, React.ReactNode> ? FragmentsFromProps<{[K in keyof PickWithMixedValues<P>]: Extract<PickWithMixedValues<P>[K], React.ReactNode>}>: never;
// type PropsFromMixedValues<P> = {[K in keyof PickWithMixedValues<P>]: Exclude<PickWithMixedValues<P>[K], React.ReactNode>}

// type PropsForChildrenFromMixedValues<P> = PickWithMixedValues<P> extends Record<string, React.ReactNode> ? {[K in keyof PickWithMixedValues<P>]: Extract<PickWithMixedValues<P>[K], React.ReactNode>} : never;

// export type SplitProps<P> = Omit<PickWithoutReactNodeValues<P> & Partial<PropsFromMixedValues<P>>, 'children'> & {children: ChildrenFromReactNodeValuesOnly<P> | ChildrenFromMixedValues<P>}


// function splitProps<P extends object>(props: P) {
//     console.log('Splitting transformed props:', props)
//     const childProps: Record<string, React.ReactElement | Array<React.ReactElement> | React.ReactNode> = {};
//     const filteredEntries = Object.entries(props).filter(([k,v])=>{
//         if(k === 'children') {
//             if(undefined === v) return false;
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//             childProps['children'] = typeof v === 'object' ? transformAstroChildren(v) : v;
//             return false;
//         }
//         if(!v) return true;
//         if(isAstroJSX(v)) {
//             childProps[k] = astroJSXToReact(v);
//             return false;
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
//         } else if(React.isValidElement(v)) {
//             childProps[k] = v;
//             return false;
//         } else if(Symbol.iterator in v) {
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
//             const arr = Array.from(v);
//             if(arr.every(x=>(typeof x !== 'function' && typeof x !== 'object' && typeof x !== 'symbol' && typeof x !== 'boolean') || React.isValidElement(x) || isAstroJSX(x))) {
//                 childProps[k] = transformAstroChildren(arr) as Array<React.ReactElement>;
//                 return false;
//             }
//         }
//         return true;
//     });
//     // PickWithReactNodeValues<P> & Partial<PropsForChildrenFromMixedValues<P>>

//     const children = Object.entries(childProps).map(([k,v])=>{
//         return React.createElement(React.Fragment, {key: k}, v)
//     })

//     console.log('New entries:', filteredEntries)
//     console.log('New children:', children);

//     // return Object.assign(Object.fromEntries(filteredEntries), {children}) as unknown as SplitProps<P>;
//     return [Object.fromEntries(filteredEntries), children] as unknown as [Omit<SplitProps<P>, 'children'>, SplitProps<P>['children']];
// }



// function fragmentsToEntries<P>(children: ChildrenFromReactNodeValuesOnly<P> | ChildrenFromMixedValues<P>) { // : (EntryOf<PropsFromFragments<typeof children>>)[] {
//     if(Symbol.iterator in children) {
//         const arr = Array.from(children as Iterable<PropFragmentElement<any, any>>).map(
//             child=>[child.props.key, child.props.children]
//         ) as (EntryOf<PropsFromFragments<typeof children>>)[]
//         return arr;
//     } else if(children) {
//         return [[children.props.key, children.props.children]];
//     }
//     return [];
// }
// export function reassembleProps<P>({children, ...props}: Omit<SplitProps<P>, 'children'> & {children?: SplitProps<P>['children']}) {
//     console.log('Reassembling props:', children, props)
//     const entries = children === null || undefined === children ? [] : fragmentsToEntries(children);
//     const assembledProps = Object.fromEntries(entries) as Partial<PropsFromFragments<Exclude<typeof children, undefined>>>;
//     return {...assembledProps, ...props}  as P
// }

// export function Dehydrated<P extends object>({key, importPath, Placeholder='div', children, fallback = false, hydrateRecurse=false, ...props}: DehydratedProps<P>) {
//     const isClient = useIsClient()
//     // if(!isClient) return <Placeholder data-hydration-import-path={importPath} {...props}>{children}</Placeholder>;
//     // typeof fallback === 'function' ? fallback?.(props) : fallback

//     const log = React.useCallback(function <T>(x: T) {
//         // @ts-expect-error TODO
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//         console.log('Dehydrated returning:', x, x.props.children);
//         return x;
//     }, [])

//     console.log('Transforming astro props:', props)
//     const [newProps, newChildren] = splitProps(transformAstroProps({...props, children}));

//     // eslint-disable-next-line @typescript-eslint/unbound-method
//     // const {getImport} = useHydrationContext();

//     // // Render a placeholder server-side (and while dehydrated). Attach the component
//     // // as a non-serializable prop so client-side transforms can read it from the node.
//     if (!isClient) {
//         return log(React.createElement(Placeholder, { key, 'data-hydration': 'dehydrated', 'data-hydrate-recurse': hydrateRecurse, 'data-import-path': importPath, keyProp: key, ...(newProps) }, newChildren));
//     }

//     // const Component = getImport<P,T>(importPath)

//     // // On client, if a Component was passed, render it (supports React.lazy).
//     // if (Component) {
//     //     // const component = <Component {...(props as React.ComponentProps<T>)}></Component>;
//     //     // const component = React.createElement(Component as ComponentType<any>, props, children);
//     //      // Transform Astro JSX in props to React elements
//     //     const transformedProps = transformPropsWithAstroJSX(props as P);
        
//     //     // Type assertion to handle LazyExoticComponent or regular components
//     //     const component = React.createElement(
//     //         Component as React.ComponentType<any>, 
//     //         { ...transformedProps } as any,
//     //         children,
//     //     );
//     //     if(fallback === false)
//     //         return log(component);
//     //     return log(<React.Suspense fallback={fallback}>
//     //         {component}
//     //     </React.Suspense>);
//     // }

//     // fallback: just render children or do import-path based hydrating if you still use it
//     return log(React.createElement(Placeholder, {key, ...transformAstroProps(props)}, children));
//     // const Component = React.useMemo(()=>getImport<T>(importPath), [importPath]);
//     // return <Component {...props}>{children}</Component>;
// }