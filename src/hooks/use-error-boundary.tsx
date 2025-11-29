import * as React from "react"

interface Return {
  hasError: boolean
  error: Error | null
  // info: React.ErrorInfo | null
  resetError: () => void
  ErrorBoundary: React.ComponentType<{
    children: React.ReactNode
    fallback?: React.ReactNode
  }>
}


class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    fallback?: React.ReactNode
    onError?: (error: Error) => void
  },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null, info: null }

  static getDerivedStateFromError(error: Error) {
    // const info: React.ErrorInfo = {componentStack: error.stack};
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError && this.props.fallback) return this.props.fallback
    if (this.state.hasError) return null
    return this.props.children
  }
}

export function useErrorBoundary(): Return {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  // const [info, setInfo] = React.useState<React.ErrorInfo | null>(null);

  const resetError = React.useCallback(() => {
    setHasError(false)
    setError(null)
    // setInfo(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setHasError(true)
    setError(error)
    // setInfo(info);
  }, [])

  const ErrorBoundaryComponent: React.ComponentType<{
    children: React.ReactNode
    fallback?: React.ReactNode
  }> = ({ children, fallback }) => (
    <ErrorBoundary onError={handleError} fallback={fallback}>
      {children}
    </ErrorBoundary>
  )

  return { hasError, error, resetError, ErrorBoundary: ErrorBoundaryComponent }
}
