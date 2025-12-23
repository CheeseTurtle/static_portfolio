import React, { isValidElement, cloneElement } from "react";

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

