import React, { isValidElement, cloneElement } from "react";
import { shallow } from "zustand/shallow";

export function transformTree(
  node: React.ReactNode,
  transform: (node: React.ReactElement) => React.ReactNode,
  shouldTransform?: (node: React.ReactElement) => boolean,
  recurse?: boolean,
): React.ReactNode {
  if (node === null || typeof node === "string" || typeof node === "number" || typeof node === "boolean" || typeof node === 'bigint' || typeof node === 'symbol' || typeof node === 'undefined') {
    return node;
  }

  if (Array.isArray(node)) {
    return (node as React.ReactNode[]).map(child => transformTree(child, transform, shouldTransform, recurse));
  }

  if (!isValidElement(node)) {
    console.warn('Node is not a valid element:', node);
    return node;
  }

  const doTransform = !shouldTransform || shouldTransform(node);

  const oldChildren = (node as React.ReactElement<{children?: React.ReactNode}, any>).props.children;
  if(doTransform && !recurse) return transform(node);
  if(!oldChildren || typeof oldChildren !== 'object') return (doTransform ? transform(node) : node);
  
  // console.log('Transforming children:', oldChildren);

  // Recursively transform children
  const newChildren = React.Children.map((oldChildren as React.ReactElement), (child)=>transformTree(child, transform, shouldTransform, recurse));

  // Clone element with transformed children
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const cloned = cloneElement(node, { ...(node as React.ReactElement<any, any>).props, children: newChildren });

  // Let transform optionally replace this node
  return doTransform ? transform(cloned) : cloned;
}




export function transformTreeWithChildren(
  node: React.ReactNode,
  // transformNode?: (node: React.ReactElement) => React.ReactElement,
  transform: (node: React.ReactElement) => React.ReactElement,
  recurse?: boolean,
  shouldTransform?: (node: React.ReactElement) => boolean,
): React.ReactNode {
  if (node === null || typeof node === "string" || typeof node === "number" || typeof node === "boolean" || typeof node === 'bigint' || typeof node === 'symbol' || typeof node === 'undefined') {
    return node;
  }

  if (Array.isArray(node)) {
    return (node as React.ReactNode[]).map(child => transformTreeWithChildren(child, transform, recurse, shouldTransform));
  }

  if (!isValidElement(node)) {
    console.warn('Node is not a valid element:', node);
    return node;
  }

  // if(shouldTransform && !shouldTransform(node)) return node;
  
  
  const doTransform = (shouldTransform && !shouldTransform(node));
  // const transformed = doTransform ? node : transform(node);
  
  const oldChildren = (node as React.ReactElement<{children?: React.ReactNode}, any>).props.children;
  if(!oldChildren || typeof oldChildren !== 'object') return (doTransform ? transform(node) : node);

  if(!doTransform || recurse) {
    // const transformed = doTransform ? transform(node) : node;
    // Recursively transform children
    const newChildren = React.Children.map((oldChildren as React.ReactElement), (child)=>transformTreeWithChildren(child, transform, recurse, shouldTransform));
    
    // Clone element with transformed children
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const cloned = cloneElement(node, { ...(node as React.ReactElement<any, any>).props, children: newChildren });
    
    // Let transform optionally replace this node
    return doTransform ? transform(cloned) : cloned;
  }

  return transform(node);
}

// type StrOrConstructor<P> = string | React.JSXElementConstructor<P>;
// export type ConditionalTransformFunc<PI = any, TI extends StrOrConstructor<any> = StrOrConstructor<any>,
//   PO = any, TO extends StrOrConstructor<any> = StrOrConstructor<any>> = {
//     (node: React.ReactElement<PI, TI>): [result: React.ReactElement<PO,TO>, recurse: boolean],
//   }

// export type ConditionalTransformFunc<II extends React.ReactElement=any, OO extends React.ReactElement=any> = <I extends React.ReactElement = II, O extends React.ReactElement = OO>(node: I) => [result: O, recurse: boolean];
export type ConditionalTransformFunc<I extends React.ReactElement = React.ReactElement, O extends React.ReactElement = React.ReactElement> = (node: I) => [result: O, recurse: boolean];

export function transformTreeConditionally<F extends ConditionalTransformFunc<any, any>>(
  node: React.ReactNode,
  transform: F,
): React.ReactNode {
  if (node === null || undefined === node || typeof node === "string" || typeof node === "number" || typeof node === "boolean" || typeof node === 'bigint' || typeof node === 'symbol' || typeof node === 'undefined') {
    return node;
  }
  // const transform_ = (node: React.ReactElement) => transform(node, transform);
  
  if(node instanceof Promise) {
    return node.then(x=>transformTreeConditionally(x, transform))
  }

  if (Array.isArray(node)) {
    // console.warn('Transforming array:', node);
    return (node as React.ReactNode[]).map(child => transformTreeConditionally(child, transform));
  } else if(Symbol.iterator in node) {
    return Array.from(node).map(child=>transformTreeConditionally(child, transform))
  }


  if (!isValidElement(node)) {
    console.warn('Node is not a valid element:', node);
    return node;
  }

  // const [newProps_, recurse] = transform(node);
  
  //   // @ts-expect-error Potentially empty object props type
  // const oldChildren = node.props?.children as React.ReactNode;
  // if(newProps_ === null && (!recurse || oldChildren === null || undefined === oldChildren)) return node;
  // const newProps: object | undefined = newProps_ === null ? node.props : newProps_;
  // const newChildren = recurse ? transformTreeConditionally(oldChildren, transform) : oldChildren;
  

  // if(node.type === 'portal')
  //   return node;

  type T = F extends ConditionalTransformFunc<typeof node, infer T extends React.ReactElement> ? T : never;

  // @ts-expect-error Untyped children
  const originalChildren = node.props?.children as React.ReactNode;
  
  const [result, recurse] = (transform as ConditionalTransformFunc<React.ReactElement, T>)(node);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const oldChildren = result.props?.children as React.ReactNode;

  // if(originalChildren !== oldChildren) {
    // console.log('originalChildren / oldChildren', originalChildren, oldChildren);
  // }
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if(!recurse) return result;
  
  if(oldChildren === null || undefined === oldChildren) return result as React.ReactNode;

  const newChildren = transformTreeConditionally(oldChildren, transform);
  // if(oldChildren !== newChildren)
  //   console.log('oldChildren:', oldChildren, newChildren, node);
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const props_ = (result && typeof result === 'object' && React.isValidElement(result) && result.props ? result.props : {})

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return cloneElement(result, {...props_}, newChildren);
  
  // if(!recurse) {
  //   if(!changed) return node;
  //   if(!args) return result;
  // }
  // const [newProps, newChildren] = (()=>{
  //   const newChildren = (
  //     args ? (
  //       recurse ? transformTree(args[1], transform_) : args[1]
  //     ) : (
  //       recurse ? transformTree(result!.)
  //     )
  //   )
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //   const [newProps, newChildren] = args;
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //   return cloneElement(node, {...newProps, children: newChildren})
  // })();

  // if(recurse) 

  // const doTransform = !shouldTransform || shouldTransform(node);

  // const oldChildren = (node as React.ReactElement<{children?: React.ReactNode}, any>).props.children;
  // if(doTransform && !recurse) return transform(node);
  // if(!oldChildren || typeof oldChildren !== 'object') return (doTransform ? transform(node) : node);
  
  // // console.log('Transforming children:', oldChildren);

  // // Recursively transform children
  // const newChildren = React.Children.map((oldChildren as React.ReactElement), (child)=>transformTree(child, transform, shouldTransform, recurse));

  // // Clone element with transformed children
  // // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  // const cloned = cloneElement(node, { ...(node as React.ReactElement<any, any>).props, children: newChildren });

  // // Let transform optionally replace this node
  // return doTransform ? transform(cloned) : cloned;
}
