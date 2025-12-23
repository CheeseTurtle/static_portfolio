import React from 'react';
// import { useSessionStorage } from '@/hooks/use-session-storage';


export type InterpItemProps<K extends string = any> = {
    detail: number,
    level: number,
    topics: null | K[],
}
export type InterpContextValue<K extends string> = {
    // showInTooltip: boolean,
    detail: number,
    level: number,
    topics: 'all' | K[],

    allTopicsRef: React.RefObject<Set<K>>,
    
    // setShowInTooltip: (value: boolean) => void,
    setDetail: (value: number) => void,
    setLevel: (value: number) => void,
    setTopics: (value: K[]) => void,

    addTopic: (value: K) => boolean,
    removeTopic: (value: K) => boolean,
}

export const InterpContext = React.createContext<InterpContextValue<any> | null>(null);


export function useInterpContext<K extends string = any>() {
    const value: InterpContextValue<K> | null = React.useContext(InterpContext);
    if(!value) throw new Error('Not inside InterpContext Provider');
    return value;
}
