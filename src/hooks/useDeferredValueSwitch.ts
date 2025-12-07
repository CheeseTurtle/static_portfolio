import React from "react";


function useToggle(initialValue: boolean = false): [boolean, (value?: boolean)=>void] {
    const [toggler, setToggler] = React.useState<boolean>(initialValue);
    const toggle = React.useCallback((value?: boolean) => setToggler(prev=>(value ?? !prev)), []);
    return [toggler, toggle];
}


export function useSwitchableDeferredValue<T>(initialValue: T, initialInitialValue?: T, initialUseDeferred: boolean = false) {
    const [rawValue, setRawValue] = React.useState<T>(initialValue);
    const deferredValue = React.useDeferredValue<T>(rawValue, initialInitialValue);

    // const lastRawValueRef = React.useRef<T>(rawValue);
    // const lastDeferredValueRef = React.useRef<T>(deferredValue);
    
    const useDeferredRef = React.useRef<boolean>(initialUseDeferred);
    
    // TODO: Refactor out toggler
    const [toggler, toggle] = useToggle();
    const toggleSafe = React.useEffectEvent(toggle);
    
    const [outValue, setOutValue] = React.useState<T>(initialUseDeferred ? deferredValue : rawValue)

    const setUseDeferred = React.useCallback((useDeferred: boolean) =>{
        if(useDeferredRef.current !== useDeferred) {
            useDeferredRef.current = useDeferred;
            toggleSafe();
        }
    }, []);


    React.useEffect(()=>{
        if(!useDeferredRef.current) setOutValue(rawValue);
    }, [rawValue]);

    React.useEffect(()=>{
        if(useDeferredRef.current) setOutValue(deferredValue);
    }, [deferredValue]);

    const syncOutValue = React.useEffectEvent((useDeferred: boolean) =>
        setOutValue((useDeferred ? deferredValue : rawValue))
    );

    React.useEffect(()=>{
        syncOutValue(useDeferredRef.current);
    }, [toggler]);
    
    const setValue = React.useCallback((value: T, useDeferred?: boolean) => {
        if(useDeferred !== undefined)
            useDeferredRef.current = useDeferred;
        setRawValue(value);
        if(useDeferred === false) // TODO: Only if setRawValue did not change rawValue?
            setOutValue(value);
    }, []);

    return [outValue, setValue, setUseDeferred];
}

export function useSwitchableValue<T1, T2 = T1>(initalValueA: T1, initialValueB: T2, initiallyUseB: boolean = false) {
    const [valueA, setValueA_] = React.useState<T1>(initalValueA);
    const [valueB, setValueB_] = React.useState<T2>(initialValueB);
    
    const useValueBRef = React.useRef<boolean>(initiallyUseB);
    
    // TODO: Refactor out toggler
    const [toggler, toggle] = useToggle();
    const toggleSafe = React.useEffectEvent(toggle);
    
    const [outValue, setOutValue] = React.useState<T1 | T2>((initiallyUseB ? valueB : valueA));

    const setUseValueB = React.useCallback((useValueB: boolean) =>{
        if(useValueBRef.current !== useValueB) {
            useValueBRef.current = useValueB;
            toggleSafe();
        }
    }, []);

    React.useEffect(()=>{
        if(!useValueBRef.current) setOutValue(valueA);
    }, [valueA]);

    React.useEffect(()=>{
        if(useValueBRef.current) setOutValue(valueB);
    }, [valueB]);

    const syncOutValue = React.useEffectEvent((useValueB: boolean) =>
        setOutValue((useValueB ? valueB : valueA))
    );

    React.useEffect(()=>{
        syncOutValue(useValueBRef.current);
    }, [toggler])
    

    const setValueA = React.useCallback((value: T1, useValueA?: boolean) => {
        if(useValueA !== undefined)
            useValueBRef.current = !useValueA;
        setValueA_(value);
        if(useValueA === true)
            setOutValue(value);
    }, []);

    const setValueB = React.useCallback((value: T2, useValueB?: boolean) => {
        if(useValueB !== undefined)
            useValueBRef.current = !useValueB;
        setValueB_(value);
        if(useValueB === true)
            setOutValue(value);
    }, []);

    return [outValue, setValueA, setValueB, setUseValueB];
}



export function useStateWithChangeCheck<T>(initialValue: T, initiallyEnableCheck: boolean = true) {
    const [rawValue, setRawValue] = React.useState<T>(initialValue);
    // const [enableCheck, setEnableCheck] = React.useState<boolean>(initiallyEnableCheck);
    const enableCheckRef = React.useRef<boolean>(initiallyEnableCheck);

    const rawValueRef = React.useRef<T>(rawValue);

    React.useEffect(()=>{
        // if(enableCheckRef.current) 
            rawValueRef.current = rawValue;
    }, [rawValue]);

    const setEnableCheck = React.useCallback((enable: boolean) => {
        enableCheckRef.current = enable;
    }, []);

    const setValue = React.useCallback((value: T)=>{
        if(enableCheckRef.current && rawValueRef.current === value) return false;
        setRawValue(value);
        return true;
    }, []) as typeof setRawValue;

    return [rawValue, setValue, setEnableCheck] as [typeof rawValue, typeof setValue, typeof setEnableCheck];
}


export function useDeferredValueSwitch<T>(initialValue: T, initialInitialValue?: T) {
    const [rawValue, setRawValue] = React.useState<T>(initialValue);
    const deferredValue = React.useDeferredValue<T>(rawValue, initialInitialValue);

    const rawValueRef = React.useRef<T>(rawValue);
    const deferredValueRef = React.useRef<T>(deferredValue);

    React.useEffect(()=>{
        rawValueRef.current = rawValue;
    }, [rawValue]);

    React.useEffect(()=>{
        deferredValueRef.current = deferredValue;
    }, [deferredValue]);

    const getOutValue = React.useCallback((useDeferred: boolean) => (useDeferred ? deferredValueRef.current : rawValueRef.current), []);

    const setValue = React.useCallback((value: T): boolean => {
        if(value === rawValueRef.current) return false; // TODO: Custom equality fn?
        setRawValue(value);
        return true;
    }, []);

    return {rawValue, deferredValue, setValue, getOutValue};
}

export function UseDeferredValueSwitchValue<T>({setValue: setRawValue, getOutValue}: ReturnType<typeof useDeferredValueSwitch<T>>, initialUseDeferred: boolean = false) {
    const useDeferredRef = React.useRef<boolean>(initialUseDeferred);
    
    const [outValue, setOutValue] = React.useState<T>(getOutValue(initialUseDeferred));

    const setUseDeferred = React.useCallback((useDeferred: boolean) => {
        if(useDeferredRef.current !== useDeferred) {
            useDeferredRef.current = useDeferred;
            setOutValue(getOutValue(useDeferred));
        }
    }, [getOutValue]);

    const setValue = React.useCallback((value: T, useDeferred?: boolean) => {
        if(!setRawValue(value) && useDeferred === false && useDeferredRef.current) {
            useDeferredRef.current = false;
            setOutValue(value);
        }
    }, [setRawValue]);

    return [outValue, setValue, setUseDeferred];
}
