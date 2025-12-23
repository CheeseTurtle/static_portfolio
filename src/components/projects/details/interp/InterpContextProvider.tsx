import React from "react";
import { InterpContext, type InterpContextValue } from "./interpContext";

export function InterpContextProvider<K extends string = any>({children, key}: {children?: React.ReactNode, key?: string}) {
    const [detail, setDetail] = React.useState<number>(0);
    const [level, setLevel] = React.useState<number>(0);
    const [topics_, setTopics_] = React.useState<K[] | 'all'>('all');

    const topicsRef = React.useRef<K[] | 'all'>('all');
    const allTopicsRef = React.useRef<Set<K>>(new Set());
    // React.useEffect(()=>{ topicsRef.current = topics_; }, [topics_]);
    const setTopics = React.useCallback((value: K[] | 'all') => {
        if(!value?.length && !topicsRef.current?.length) return;
        if(value === 'all' && topicsRef.current === 'all') return;
        topicsRef.current = value;
        setTopics_(value);
    }, []);
    const addTopic = React.useCallback((value: K) => {
        if(topicsRef.current === 'all') return false;
        if(topicsRef.current.includes(value)) return false;
        setTopics(topicsRef.current.concat(value));
        return true;
    }, [setTopics])
    const removeTopic = React.useCallback((value: K) => {
        if(topicsRef.current === 'all') {
            if(!allTopicsRef.current?.size) return false;
            const allTopics = Array.from(allTopicsRef.current);
            const idx = allTopics.findIndex(x=>x===value);
            if(idx < 0) return false;
            allTopics.splice(idx, 1);
            setTopics(allTopics);
            // setTopics(allTopics.slice(0,idx).concat(...allTopics.slice(idx+1)))
        } else if(!topicsRef.current.includes(value)) return false;
        else {
            setTopics(topicsRef.current.filter(x=>x!==value));
        }
        return true;
    }, [setTopics])
    

    const value: InterpContextValue<K> = React.useMemo(()=>({
        detail,
        level,
        topics: topics_,
        allTopicsRef,
        setDetail, setLevel, setTopics, addTopic, removeTopic,
    }), [detail, level, topics_, setTopics, addTopic, removeTopic]);
    return <InterpContext.Provider key={key} value={value}>{children}</InterpContext.Provider>
}