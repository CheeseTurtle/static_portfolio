import * as React from 'react';

export function useDeferredValueWithStatus<T>(initialValue: T) {// opts?: UseDeferredValueWithStatusOptions<T>) {
    const [value, setValue] = React.useState<T>(initialValue);
    const deferredValue = React.useDeferredValue(value);

    const isPending = value !== deferredValue;

    return {
        value, setValue, deferredValue, isPending//, refresh: toggleToggler
    }
}

export function useDeferredValueTransition<T>(initialValue: T) {// opts?: UseDeferredValueWithStatusOptions<T>) {
    const [transitionIsPending, startTransition] = React.useTransition();
    const [value, setValue] = React.useState<T>(initialValue);
    const deferredValue = React.useDeferredValue(value);

    const isPending = value !== deferredValue;

    const setValueInTransition = (value: T) => startTransition(() => {
        setValue(value);
    });

    return {
        value, setValue: setValueInTransition, deferredValue, isPending, transitionIsPending
    }
}
