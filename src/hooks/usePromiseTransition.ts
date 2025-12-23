// 'use client';

// import React from "react";


// type AsyncFunc<P extends any[],R> = (...args: P) => Promise<R>;
// // type AsyncFunc<F extends _AsyncFunc<any,any>> = (...args: Parameters<F>) => ReturnType<F>;

// // type UsePromiseTransition = {
// //     <P extends any[], R>(func: AsyncFunc<P,R>, args: P): any,
// //     <P extends [any, ...any[]], R>(func: AsyncFunc<P,R>, args: P): any,
// //     <P extends [], R>(func: AsyncFunc<[],R>, args?: undefined): any;
// // }

// // const usePromiseTransition_: UsePromiseTransition = usePromiseTransition
// // const f = (index: number, size: number): Promise<boolean> => new Promise(()=>{});
// // usePromiseTransition_(f);

// // function usePromiseTransition<R, P extends [any, ...any[]]>(func: AsyncFunc<P,R>, parameters: P): any;
// // function usePromiseTransition<R>(func: AsyncFunc<[],R>): any;
// // function usePromiseTransition<R, P extends [] = []>(func: AsyncFunc<P,R>, parameters?: P): any;
// // function usePromiseTransition<R, P extends any[]>(func: AsyncFunc<P,R>, parameters?: P): any {

// // }


// type PromiseExecutor<T> = ConstructorParameters<typeof Promise<T>>[0]
// type PromiseResolver<T> = Parameters<PromiseExecutor<T>>[0]
// type PromiseRejector<T> = Parameters<PromiseExecutor<T>>[0]


// export function usePromiseWrap<R>(func: ()=>R): AsyncFunc<[],R> {
//     const wrapper = React.useCallback(()=>{
//         const promise = new Promise<R>((resolve) => {
//             resolve(func())
//         })
//         return promise;
//     }, [func])
//     return wrapper;
// }

// export function useStableCallback<F extends ((...args: any[]) => any)>(func: F) {
//     const funcRef = React.useRef<(...args: Parameters<F>) => ReturnType<F>>(func);
//     React.useEffect(()=>{
//         funcRef.current = func;
//     }, [func]);

//     const stableFunc = React.useCallback((...args: Parameters<F>): ReturnType<F> => {
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//         return funcRef.current(...args)
//     }, [])
//     return [stableFunc, funcRef] as [typeof stableFunc, typeof funcRef];
// }

// function usePromiseTransition<R>(func: AsyncFunc<[], R>, startTransition: typeof React.startTransition = React.startTransition) {
//     const [promise, setPromise] = React.useState<Promise<R> | null>(null);
//     const [startTransitionFunc,] = useStableCallback(startTransition ?? React.startTransition);
    
//     const startPromiseTransition = React.useCallback((func: React.TransitionFunction)=>{


//     }, [])
// }


// export default usePromiseTransition;