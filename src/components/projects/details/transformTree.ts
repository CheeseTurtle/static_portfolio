import React, { isValidElement, cloneElement } from "react";

export function transformTree(
  node: React.ReactNode,
  transform: (node: React.ReactElement) => React.ReactNode
): React.ReactNode {
  if (node === null || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return node;
  }

  if (Array.isArray(node)) {
    return (node as React.ReactNode[]).map(child => transformTree(child, transform));
  }

  if (!isValidElement(node)) {
    console.warn('Node is not a valid element:', node);
    return node;
  }

  const oldChildren = (node as React.ReactElement<{children?: React.ReactNode}, any>).props.children;
  if(!oldChildren || typeof oldChildren !== 'object') return transform(node);
  
  // Recursively transform children
  const newChildren = React.Children.map((oldChildren as React.ReactElement), (child)=>transformTree(child, transform));

  // Clone element with transformed children
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const cloned = cloneElement(node, { ...(node as React.ReactElement<any, any>).props, children: newChildren });

  // Let transform optionally replace this node
  return transform(cloned);
}
