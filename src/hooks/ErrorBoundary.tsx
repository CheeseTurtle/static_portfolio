import { useErrorBoundary } from "./use-error-boundary";
import * as React from 'react';

interface ErrorBoundaryHandle {
    resetError: ()=>void,
}

type ErrorBoundaryProps = React.ComponentProps<ReturnType<typeof useErrorBoundary>['ErrorBoundary']> & {callback?: (error: Error)=>void, children: React.ReactNode, fallback?: React.ReactNode, displayName?: string | undefined};

const ErrorBoundary = React.forwardRef<ErrorBoundaryHandle,ErrorBoundaryProps >(({callback, children, displayName, fallback, ...props}: ErrorBoundaryProps, ref) => {

    const {ErrorBoundary: ErrorBoundaryComponent, error, hasError, resetError} = useErrorBoundary();
    React.useImperativeHandle(ref, () => ({
        resetError
    }), [resetError]);

    const prevError = React.useRef<Error>(null);
    const prevHasError = React.useRef<boolean>(false);
    // const prevInfo = React.useRef<React.ErrorInfo>(null);


    React.useEffect(()=>{
        if(hasError === prevHasError.current && error === prevError.current) return;
        if(hasError && error)
            callback?.(error);
        prevError.current = error;
        prevHasError.current = hasError;
        // prevInfo.current = info;
    }, [hasError, error, callback]);

    if(displayName !== ErrorBoundaryComponent.displayName)
        ErrorBoundaryComponent.displayName = displayName;

    return <ErrorBoundaryComponent fallback={fallback} {...props}>
        {children}
    </ErrorBoundaryComponent>;
});

export default ErrorBoundary;