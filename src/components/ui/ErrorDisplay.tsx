import { AlertCircle, RefreshCw, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface ErrorDisplayProps {
  error: Error | string
  onRetry?: () => void
  onDismiss?: () => void
  fullScreen?: boolean
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  fullScreen = false,
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const errorMessage = typeof error === 'string' ? error : error.message

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true)
      try {
        await onRetry()
      } finally {
        setIsRetrying(false)
      }
    }
  }

  const content = (
    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-400 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
        <AlertCircle className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-red-900 dark:text-red-100 font-semibold text-sm mb-1">出错了</h3>
        <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? '重试中...' : '重试'}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 icon-btn text-red-600 dark:text-red-400"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-sky-blue-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
        {/* Aurora background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-400/10 rounded-full blur-3xl animate-aurora-glow" />
        </div>
        <div className="relative max-w-md w-full">{content}</div>
      </div>
    )
  }

  return content
}

/**
 * Inline error message for form fields
 */
export function FieldError({ error }: { error: string | undefined }) {
  if (!error) return null

  return (
    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{error}</span>
    </p>
  )
}

/**
 * Error boundary fallback component
 */
interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sky-blue-50/50 dark:bg-slate-900/50">
      {/* Aurora background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-400/10 rounded-full blur-3xl animate-aurora-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-blue-400/10 rounded-full blur-3xl animate-aurora-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-md w-full glass-card p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-400 flex items-center justify-center shadow-glow-sm">
          <AlertCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-sky-blue-900 dark:text-sky-blue-100 mb-3">出错了</h1>
        <p className="text-sky-blue-700 dark:text-sky-blue-300 mb-6">{error.message}</p>
        <button
          onClick={resetError}
          className="btn-primary"
        >
          重新加载
        </button>
      </div>
    </div>
  )
}

/**
 * Toast notification for errors
 */
interface ErrorToastProps {
  error: string
  onDismiss: () => void
}

export function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full glass-card border border-red-200 dark:border-red-800/50 shadow-glass-md animate-in slide-in-from-right">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-400 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sky-blue-900 dark:text-sky-blue-100 text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 icon-btn text-red-600 dark:text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
