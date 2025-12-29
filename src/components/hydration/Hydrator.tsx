'use client';

import React from 'react';
import { transformTreeConditionally } from '../projects/details/transformTree';
import { useHydrationContext } from './hydrationContext';
import { hydrateNode } from './hydrate';
// import { getImport } from './Dehydrated';


// export function Hydrator({ref}: {ref: React.RefObject<React.ReactElement | React.ReactPortal>}) {
//     React.useInsertionEffect(()=>{
//         if(ref.current === null || ref.current === undefined) return;
//         if(!ref.current.props) return;
//         ref.current.props.children = transformTreeConditionally(ref.current.props.children, transformNode)
//     }, [])
// }


export function Hydrator({children}: {children?: React.ReactNode}){
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {getImport} = useHydrationContext();
    const transformNode_: Parameters<typeof transformTreeConditionally>[1] = React.useCallback( function<P, T extends React.ComponentType<P>=React.ComponentType<P>>(node: React.ReactElement<P,T> ) { return hydrateNode(getImport, node) }, [getImport]);
    return transformTreeConditionally(children, transformNode_);
}

export default Hydrator;
