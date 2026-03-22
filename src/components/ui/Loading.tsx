import { Loader2, Sparkles } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Aurora Spinner */}
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} text-sky-blue-500 animate-spin`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-sky-blue-300/30 animate-ping`} />
      </div>
      {text && (
        <p className="text-sm text-sky-blue-600 dark:text-sky-blue-400 font-medium animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-sky-blue-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50">
        {/* Aurora background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-blue-400/20 rounded-full blur-3xl animate-aurora-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-adventure-400/20 rounded-full blur-3xl animate-aurora-glow" style={{ animationDelay: '1s' }} />
        </div>
        {content}
      </div>
    )
  }

  return content
}

/**
 * Inline loading spinner for use in buttons
 */
export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <Loader2 className={`${sizeClasses[size]} text-white animate-spin`} />
}

/**
 * AVA typing indicator - shows when AVA is "thinking"
 */
export function AvaTyping() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-sky-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-sky-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-sky-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-sky-blue-600 dark:text-sky-blue-400 font-medium">AVA 正在思考...</span>
    </div>
  )
}

/**
 * Content generation loading with shimmer effect
 */
export function ContentGenerating({ type }: { type: 'note' | 'poetry' | 'review' }) {
  const typeText = {
    note: '旅行笔记',
    poetry: '诗歌',
    review: '酒店点评',
  }[type]

  return (
    <div className="glass-card p-6 w-full max-w-md">
      <div className="flex flex-col items-center gap-4">
        {/* Aurora Sparkles Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-blue-500 to-sky-blue-400 flex items-center justify-center shadow-glow-sm animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-sky-blue-400/20 via-adventure-400/20 to-sky-blue-300/20 animate-spin" />
        </div>

        <div className="text-center">
          <p className="text-sky-blue-900 dark:text-sky-blue-100 font-heading font-semibold text-lg mb-1">
            正在生成{typeText}
          </p>
          <p className="text-sm text-sky-blue-600 dark:text-sky-blue-400">
            AI 正在为您创作精彩内容...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-sky-blue-100 dark:bg-sky-blue-900/50 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-blue-500 to-adventure-500 rounded-full animate-shimmer" style={{ width: '60%' }} />
        </div>

        <AvaTyping />
      </div>
    </div>
  )
}

/**
 * Skeleton loader for content
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-sky-blue-100 dark:bg-sky-blue-900/30 rounded ${className || 'h-4 w-full'}`}
    />
  )
}

/**
 * Message bubble skeleton for chat
 */
export function MessageSkeleton() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-blue-500/20 to-sky-blue-400/20 flex-shrink-0 animate-pulse" />
      <div className="max-w-[65%] space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  )
}

/**
 * Card skeleton with Aurora styling
 */
export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-blue-500/20 to-sky-blue-400/20 animate-pulse" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-2 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

/**
 * Quick action card skeleton
 */
export function QuickActionSkeleton() {
  return (
    <div className="glass-card p-5 card-hover">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-blue-500/20 to-sky-blue-400/20 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}
