import * as React from 'react';
// import {Suspense, type SuspenseProps, useDeferredValue, useInsertionEffect, useLayoutEffect, useOptimistic, useTransition} from 'react';
import type { SuspenseProps } from 'react';
import { Button } from '../ui/button';
// import * as DOM from 'react-dom';

// React.useActionState(action, initialState)
// DOM.useFormState(action, initialState)
// DOM.useFormStatus()
// DOM.requestFormReset

// React.useTransition()
// React.startTransition(scope)


// React.useDeferredValue
// React.useOptimistic(passthrough)

// React.useInsertionEffect(effect)
// React.useLayoutEffect(effect)

// DOM.flushSync(fn)
// DOM.createPortal(children, container)

// requestAnimationFrame(callback)
// requestIdleCallback(callback)

// React.use(usable)
// React.act(callback)

// React.captureOwnerStack()
// React.lazy(load)

{/* <React.Activity mode={hiddenOrVisible}></React.Activity> */ }
{/* <React.Suspense fallback={undefined}></React.Suspense> */ }



// timeout
// open()
// isOpened


// interface SuspendedHandle {
//     get isSuspended(): boolean,
//     suspend(): boolean,
//     unsuspend(): boolean,
// };
// type SuspendedProps = SuspenseProps & {
//     ref?: React.RefObject<SuspendedHandle>,
//     initSuspended: boolean,
//     delay?: number,
//     handlePromise: (promise: PromiseInfo<boolean | number>) => number | void,
// }


type PromiseConstructorType<T> = (typeof Promise<T>);
type PromiseExecutor<T> = ConstructorParameters<PromiseConstructorType<T>>[0];
type PromiseResolve<T> = Parameters<PromiseExecutor<T>>[0];
type PromiseReject<T> = Parameters<PromiseExecutor<T>>[1];
type PromiseInfo<T> = { promise: Promise<T>, resolve: PromiseResolve<T>, reject: PromiseReject<T>, get isFinished(): boolean };


// type PromiseInfo<T> = [Promise<T>, PromiseConstructorType<T>['resolve'], PromiseConstructorType<T>['reject'], PromiseConstructorLike]
// type PromiseInfo<T> = [Promise<T>, ...Parameters<ConstructorParameters<PromiseConstructorLike>[0]>]

// function Suspended({ref, delay, initSuspended = true, handlePromise, children, fallback, ...props}: SuspendedProps) {
//     const [suspended, setSuspended] = React.useState<boolean>(initSuspended);
//     const isSuspended = React.useRef<boolean>(initSuspended);

//     React.useEffect(()=>{
//         isSuspended.current = suspended;
//     }, [suspended]);

//     const handlePromiseRef = React.useRef<typeof handlePromise>(handlePromise);
//     React.useEffect(()=>{
//         handlePromiseRef.current = handlePromise;
//     }, [handlePromise]);

//     const delayRef = React.useRef<typeof delay>(delay);
//     React.useEffect(()=>{
//         delayRef.current = delay;
//     }, [delay]);

//     const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
//     const applyDelay = React.useCallback(()=>{
//         clearTimeout(timeoutRef.current);
//         timeoutRef.current = setTimeout(()=>setSuspended(false))
//     }, [delay, setSuspended]);

//     React.useImperativeHandle(ref, () => ({
//         suspend() {
//             if(isSuspended.current) return false;
//             setSuspended(true);
//             return true;
//         },
//         unsuspend() {
//             if(!isSuspended.current) return false;
//             setSuspended(false);
//             return true;
//         },
//         get isSuspended(): boolean {
//             return isSuspended.current
//         }
//     }), [setSuspended]);


//     const promiseRef = React.useRef<PromiseInfo<boolean| number> | null>(null);

//     const clearPromise = React.useCallback((rejectPromise?: boolean)=>{
//         clearTimeout(timeoutRef.current);
//         if(!promiseRef.current) return;
//         try {
//             if(rejectPromise && !promiseRef.current.isFinished) promiseRef.current.reject('replaced');
//         } finally {
//             promiseRef.current = null;
//         }
//     }, []);


//     const applyPromiseHandler = React.useCallback((info: PromiseInfo<boolean | number>, delay?: number)=>{
//         clearTimeout(timeoutRef.current);
//         if(delay && delay > 0) {
//             timeoutRef.current = setTimeout(()=>{applyPromiseHandler(info)}, delay);
//             return;
//         }
//         try {
//             const result = handlePromiseRef.current(info);
//             if(result !== undefined)
//                 timeoutRef.current = setTimeout(()=>{applyPromiseHandler(info)}, result);
//         } catch (e) {
//             clearPromise(true); // TODO: reason?
//             // promiseRef.current = null; // TODO
//             throw e;
//         }
//         // }
//     }, []);

//     // React.useInsertionEffect(effect)
//     React.useEffect(()=>{
//         let finished: boolean = false;
//         let resolveFunc: ((value: boolean | number) => void) | undefined = undefined;
//         let rejectFunc: ((reason?: any) => void) | undefined = undefined;
//         const promise = new Promise<boolean|number>((resolve, reject) => {
//             clearPromise(true);
//             resolveFunc = resolve;
//             rejectFunc = reject;
//             const info: PromiseInfo<boolean | number> = {
//                 promise,
//                 resolve(value) {
//                     clearTimeout(timeoutRef.current);
//                     resolve(value);
//                     finished = true;
//                 }, 
//                 reject(reason?: any) {
//                     clearTimeout(timeoutRef.current);
//                     reject(reason);
//                     finished = true;
//                 },
//                 get isFinished() {
//                     return finished;
//                 }
//             };
//             promiseRef.current = info;

//             clearTimeout(timeoutRef.current);
//             applyPromiseHandler(info, delayRef.current);
//         });

//         return () => {
//             clearPromise(true);
//         }
//     }, [applyPromiseHandler]);

//     return <React.Suspense fallback={fallback} {...props}>
//         {children}
//     </React.Suspense>
// }


// function SuspendedInner({delay, fallback, children, ...props}: SuspenseProps & {delay: number}) {
//     return <React.Suspense fallback={fallback} {...props}>
//         {delay && delay > 0 ? (

//         ) : children}
//     </React.Suspense>
// }


type SuspendedHandle = {
    remount(delay?: number): void,
}
type SuspendedProps = SuspenseProps & {
    ref?: React.RefObject<SuspendedHandle>,
    delay?: number,
    alt?: React.ReactNode
};
// function Suspended({ref, children, alt = null, delay: initialDelay = 0, ...props}: SuspendedProps) {
//     const [toggler, setToggler] = React.useState<boolean>(false);
//     const toggleToggler = React.useCallback(()=>{
//         setToggler(v=>!v);
//     }, [setToggler]);

//     const delayRef = React.useRef<number>(initialDelay);

//     React.useImperativeHandle(ref, ()=>({
//         remount(delay?: number) {
//             if(delay !== undefined) delayRef.current = delay;
//             toggleToggler();
//         },
//     }), [toggleToggler]);

//     // const inner = React.useMemo(()=><SuspendedInner {...props} delay={delayRef.current} />, [toggler]);
//     const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
//     const rejectRef = React.useRef<(reason?: any) => void>(undefined);

//     const promise = React.useMemo(()=>{
//         const p = new Promise<boolean>((resolve, reject) => {
//             clearTimeout(timeoutRef.current);
//             rejectRef.current?.();
//             timeoutRef.current = setTimeout(()=>resolve(true), delayRef.current);
//         });
//         return p.catch(reason=>{
//             console.error(`Rejection reason: ${reason}`);
//             return false;
//         });
//     }, [toggler]);

//     const promiseResult = React.use(promise);

//     return <React.Suspense {...props}>
//         {promiseResult ? children : alt}
//     </React.Suspense>
// }


// async function delayedValue<T>(value: T, delay?: number) {
//     let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
//     let rejectFn: (reason?: any) => void;
//     const promise = new Promise<T>((resolve, reject)=>{
//         rejectFn = reject;
//         timeout = setTimeout(()=>resolve(value), delay);
//     });
//     // function cancel() {
//     //     clearTimeout(timeout);
//     //     rejectFn?.();
//     // }
//     // return [promise, cancel];
//     return promise;
// }

// async function SlowElem() {
//     return new Promise<React.JSX.Element>((resolve)=>{
//         setTimeout(()=>resolve(<div>Resolved</div>), 1000);  
//     });
// }


function SlowElem() {
    React.useEffect(() => {
        // for(let i = 0; i < 20; i++) {
        let waited: boolean = false;
        console.log('Waiting');
        let i = 0;
        // setTimeout(()=>{
        //     console.log('Timed out');
        //     waited = true
        // }, 1);
        // while(!waited) continue;
        // }
    }, []);
    return <div>Content</div>;
}


// function Transitioned() {
//     const [waiting, setWaiting] = React.useState<boolean>(true);
//     const resultRef = React.useRef<number>(0);
//     const promise = React.useMemo(() => new Promise((resolve) => {
//         console.log('Setting timeout');
//         setTimeout(()=>{
//             console.log('Timeout');
//             resultRef.current = 1000;
//             resolve(true);
//         }, 1000);
//     }), [resultRef]);


//     if(!resultRef.current) {
//         console.log(resultRef.current, promise);
//         throw promise;
//     }

//     return <div>Content</div>;
// }

function test(x: string, y: string): boolean;
function test(x: number, y: number): number;
function test(x: string | number, y: string | number): boolean | number {
    return (typeof x === 'string') ? x === y : x - (y as number);
}

interface Test {
    testFn: typeof test,

    test: {
        (x: string, y: string): boolean,
        (x: number, y: number): number,
    }
}



// export type UseDeferredValueWithStatusOptions<T> = {
//     equalityFn?: (left: T, right: T) => boolean,
// }




function useDeferredValueWithStatus<T>(initialValue: T) {// opts?: UseDeferredValueWithStatusOptions<T>) {
    const [value, setValue] = React.useState<T>(initialValue);
    const deferredValue = React.useDeferredValue(value);

    const isPending = value !== deferredValue;

    return {
        value, setValue, deferredValue, isPending//, refresh: toggleToggler
    }
}

function useDeferredValueTransition<T>(initialValue: T) {// opts?: UseDeferredValueWithStatusOptions<T>) {
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



// function useDeferredValueTransition<T>(initialValue: T) {
//     const [value, setValue] = React.useState<T>(initialValue);
//     const deferredValue = React.useState<T>(value);

//     const [isPending, startTransition] = React.useTransition();

//     const setValueInTransition = React.useCallback((func: () => T) => {
//         startTransition(() => {
//             setValue(func());
//         });
//     }, []);

//     const setValueAsTransition = React.useCallback((value: T) => {
//         startTransition(() => {
//             setValue(value);
//         });
//     }, []);
// }




async function sleep(duration: number) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), duration));
}

function sleepSync(duration: number, maxIterations?: number) {
    const startTime = Date.now();
    let i: number = 0;
    while ((!maxIterations || i <= maxIterations) && (Date.now() - startTime) < duration) {
        // Perform a dummy computation to keep the CPU busy
        Math.sqrt(Math.random() * Math.random());
        i++;
    }
}

function Transitioned() {
    const [value, setValue] = React.useState<number>(0);
    const [tvalue, setTValue] = React.useState<number>(0);
    const deferredValue = React.useDeferredValue(value);

    const [isPending, startTransition] = React.useTransition();


    const [clickCount, setClickCount] = React.useState<number>(0);


    React.useEffect(() => {
        startTransition(() => {
            setTValue(value);
        })
    }, [value]);

    // const valueRef = React.useRef<number>(value);

    // sleepSync(1000, 1e100);

    React.useEffect(() => {
        if (tvalue % 2) {
            sleepSync(2000);
        }
    }, [tvalue]);

    const onClick1: React.MouseEventHandler = React.useCallback((_evt) => {
        // startTransition(() => {
        setValue(v => (v >= 20 ? 1 : v + 5 - (v % 2)));
        // })
    }, []);

    const onClick2: React.MouseEventHandler = React.useCallback((_evt) => {
        startTransition(async () => {
            await sleep(1000);
            setValue(v => (v >= 20 ? 0 : v + 4 + (v % 2)));
        });
    }, []);


    return <>
        <div>Value: {value} / {tvalue}</div>
        <div>Deferred value: {deferredValue}</div>
        <div>Value !== deferred value: {value === deferredValue ? 'N' : 'Y'}</div>
        <div>Is pending: {isPending ? 'Y' : 'N'}</div>
        <Button onClick={onClick1}>Sync</Button>
        <Button onClick={onClick2}>Async</Button>
    </>
}


export default function SuspenseTest() {

    return <Transitioned>


    </Transitioned>
    // return <>
    //     <Suspended delay={1} fallback={<div>Fallback</div>} alt={<div>Rejected</div>}>
    //         <div>Content</div>
    //     </Suspended>
    // </>
}


