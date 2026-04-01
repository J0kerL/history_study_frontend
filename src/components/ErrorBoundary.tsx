import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * 全局错误边界组件。
 * 捕获子组件树中任何渲染时发生的错误，防止白屏。
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 生产环境可接入错误上报（Sentry 等）
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-paper-100 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-vermillion/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-serif font-bold text-vermillion">!</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-ink mb-2">
              出了点问题
            </h1>
            <p className="text-sm text-ink-light leading-relaxed mb-6">
              页面渲染时发生了错误，请尝试刷新或返回首页
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-2xl bg-paper-200 text-ink text-sm font-medium hover:bg-paper-300 active:opacity-80 transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-2xl bg-vermillion text-white text-sm font-medium hover:bg-vermillion-dark active:opacity-80 transition-colors"
              >
                返回首页
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
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
