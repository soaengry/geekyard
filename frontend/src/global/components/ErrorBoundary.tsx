import { Component, type ErrorInfo, type ReactNode } from 'react'
import { toast } from 'react-toastify'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo)
    toast.error('예상치 못한 오류가 발생했습니다.')
  }

  handleReset = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary min-h-screen flex flex-col items-center justify-center bg-background gap-4">
          <p className="text-content text-lg font-medium">
            문제가 발생했습니다
          </p>
          <p className="text-subtle text-sm">
            페이지를 새로고침하거나 나중에 다시 시도해주세요.
          </p>
          <button
            onClick={this.handleReset}
            className="error-boundary-reset px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
          >
            새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
