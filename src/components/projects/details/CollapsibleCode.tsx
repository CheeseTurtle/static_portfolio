// import type { CombinedPropertiesOf } from "@/lib/type-utils";
import { Dehydrated } from "@/components/hydration/Dehydrated";
import React from "react";
import CollapsibleCodeInner from "./CollapsibleCodeInner";

export default function CollapsibleCode({children, ...props}: React.HTMLAttributes<HTMLPreElement>) {
  const [isClient, setIsClient] = React.useState(false);

  React.useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <pre {...props}>{children}</pre>;
  }

  return <CollapsibleCodeInner {...props}>
    {children}
  </CollapsibleCodeInner>;

  // return <Dehydrated importPath='@/components/projects/details/CollapsibleCodeInner' Placeholder='div' {...props}>
  //   {children}
  // </Dehydrated>
}
