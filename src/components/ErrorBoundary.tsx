import { Component, type ErrorInfo, type ReactNode } from 'react'
import { handleError } from '../utils/errorHandler'
import { ERROR_BOUNDARY_MAX_RETRIES } from '../constants'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  retryCount: number
}

/**
 * 全局错误边界组件。
 * 捕获子组件树中任何渲染时发生的错误，防止白屏。
 * 支持有限次数的自动重试，超过次数后需用户手动操作。
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    handleError(error, 'ErrorBoundary')
    // 生产环境可接入错误上报（Sentry 等）
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { contexts: { react: _errorInfo } })
    // }
  }

  handleReset = () => {
    if (this.state.retryCount < ERROR_BOUNDARY_MAX_RETRIES) {
      // 自动重试
      this.setState((prev) => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
      }))
    } else {
      // 超过重试次数，返回首页
      this.setState({ hasError: false, error: null, retryCount: 0 })
      window.location.href = '/'
    }
  }

  handleRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const canRetry = this.state.retryCount < ERROR_BOUNDARY_MAX_RETRIES

      return (
        <div className="min-h-screen bg-paper-100 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-vermillion/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-serif font-bold text-vermillion">!</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-ink mb-2">
              出了点问题
            </h1>
            <p className="text-sm text-ink-light leading-relaxed mb-2">
              页面渲染时发生了错误
              {canRetry && '，将尝试自动恢复'}
            </p>
            {canRetry && (
              <p className="text-xs text-ink-lighter mb-6">
                重试次数：{this.state.retryCount} / {ERROR_BOUNDARY_MAX_RETRIES}
              </p>
            )}
            {!canRetry && (
              <p className="text-xs text-ink-lighter mb-6">
                已超过最大重试次数，请刷新页面或返回首页
              </p>
            )}
            <div className="flex gap-3 mb-6">
              <button
                onClick={this.handleRefresh}
                className="flex-1 py-3 rounded-2xl bg-paper-200 text-ink text-sm font-medium hover:bg-paper-300 active:opacity-80 transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-2xl bg-vermillion text-white text-sm font-medium hover:bg-vermillion-dark active:opacity-80 transition-colors"
              >
                {canRetry ? '重试' : '返回首页'}
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-ink-lighter cursor-pointer">
                  开发模式错误详情
                </summary>
                <pre className="mt-2 text-xs text-red-500 bg-paper-50 rounded-xl p-4 overflow-auto max-h-48">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
