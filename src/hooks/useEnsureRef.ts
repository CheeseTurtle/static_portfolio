import * as React from "react";

// export default function useEnsureRef<T extends undefined>(ref?: React.RefObject<T>, defaultInitialValue?: T): React.RefObject<T>;
// export default function useEnsureRef<T>(ref: React.RefObject<T> | undefined, defaultInitialValue: T): React.RefObject<T>;
// export default function useEnsureRef<T>(ref: React.RefObject<T> | undefined, defaultInitialValue?: T): React.RefObject<T> {
//     // const localRef = React.useRef<T>(defaultInitialValue as T);
//     const refObj = React.useRef<React.RefObject<T>>(ref);
//     const fromArg = React.useRef<boolean>(!!ref);

//     const initialValue = React.useRef<T>(defaultInitialValue as T);

//     React.useEffect(()=>{
//         initialValue.current = defaultInitialValue as T;
//     }, [defaultInitialValue]);

//     React.useEffect(()=>{
//         if(ref) {
//             refObj.current = ref;
//             fromArg.current = true;
//             return;
//         }

//         if(fromArg.current || !refObj.current) {
//             const newRef = React.createRef();
//             newRef.current = initialValue.current;
//             refObj.current = newRef as React.RefObject<T>;
//         }
//         fromArg.current = false;

//         //     fromArg.current) {
//         //     refObj.current = ref;
//         //     fromArg.current = true;
//         //     return;
//         // } else if(!refObj.current) {
//         //     const newRef = React.createRef();
//         //     newRef.current = initialValue.current;
//         //     refObj.current = newRef as React.RefObject<T>;
//         // }
//         // fromArg.current = false;
//     }, [ref]);

//     return refObj.current;
// }



// type UseEnsureRef = {
//     <T extends undefined>(ref?: React.RefObject<T>, defaultInitialValue?: T): React.RefObject<T>,
//     <T>(ref: React.RefObject<T> | undefined, defaultInitialValue: T): React.RefObject<T>
// };

// const useEnsureRef: UseEnsureRef = <T>(ref: React.RefObject<T> | undefined, defaultInitialValue?: T): React.RefObject<T> => {
//     const refObj = React.useRef<React.RefObject<T>>(ref);
//     const updateRef = React.useEffectEvent((refArg: React.RefObject<T> | undefined) => {
//         if(refArg) {
//             refObj.current = refArg;
//         } else {
//             refObj.current = React.createRef() as React.RefObject<T>;
//             refObj.current.current = defaultInitialValue as T;
//         }
//     });

//     React.useEffect(()=>{
//         updateRef(ref);
//     }, [ref]);

//     return refObj.current!;
// }

export type UseEnsureRef = {
    <T extends undefined>(ref?: React.RefObject<T>, defaultInitialValue?: T): React.RefObject<T>,
    <T>(ref: React.RefObject<T> | undefined, defaultInitialValue: T): React.RefObject<T>
};

export const useEnsureRef: UseEnsureRef = <T,>(
    ref: React.RefObject<T> | undefined, 
    defaultInitialValue?: T
): React.RefObject<T> => {
    const fallbackRef = React.useRef<T>(defaultInitialValue as T);
    return ref ?? fallbackRef;
};

export default useEnsureRef;