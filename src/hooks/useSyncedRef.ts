import React from "react";

export default function useSyncedRef<T>(value: T) {
    const ref = React.useRef<T>(value);
    React.useEffect(()=>{
        ref.current = value;
    }, [value])
    return ref;
}