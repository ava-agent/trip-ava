import { useEffect, useState } from 'react'
import avaAvatar from '@/assets/ava-avatar.png'

export type AvatarState = 'idle' | 'thinking' | 'speaking' | 'listening'

interface AnimatedAvatarProps {
  state?: AvatarState
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showGlow?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

const ringSizes = {
  sm: 'ring-2',
  md: 'ring-3',
  lg: 'ring-4',
  xl: 'ring-4',
}

/**
 * Animated AI Avatar Component
 * Displays different animations based on state:
 * - idle: Subtle breathing animation
 * - thinking: Pulsing glow effect
 * - speaking: Wave/bounce animation
 * - listening: Subtle pulse
 */
export function AnimatedAvatar({
  state = 'idle',
  size = 'lg',
  showGlow = true,
  className = '',
}: AnimatedAvatarProps) {
  const [animationPhase, setAnimationPhase] = useState(0)

  // Animation loop for continuous effects
  useEffect(() => {
    if (state === 'idle') {
      const interval = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 100)
      }, 50)
      return () => clearInterval(interval)
    } else if (state === 'thinking') {
      const interval = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 60)
      }, 50)
      return () => clearInterval(interval)
    } else if (state === 'speaking') {
      const interval = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 20)
      }, 30)
      return () => clearInterval(interval)
    }
  }, [state])

  // Calculate transforms based on state and phase
  const getTransform = () => {
    switch (state) {
      case 'idle': {
        // Gentle breathing - scale between 1.0 and 1.02
        const breathScale = 1 + Math.sin(animationPhase * 0.1) * 0.02
        return `scale(${breathScale})`
      }
      case 'thinking': {
        // Subtle float
        const floatY = Math.sin(animationPhase * 0.15) * -3
        return `translateY(${floatY}px)`
      }
      case 'speaking': {
        // Bounce while speaking
        const bounceScale = 1 + Math.sin(animationPhase * 0.5) * 0.03
        return `scale(${bounceScale})`
      }
      case 'listening':
        return 'scale(1)'
      default:
        return 'scale(1)'
    }
  }

  // Get glow effect based on state
  const getGlowEffect = () => {
    if (!showGlow) return {}

    switch (state) {
      case 'idle':
        return {
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
        }
      case 'thinking': {
        // Pulsing glow
        const glowIntensity = 0.3 + Math.sin(animationPhase * 0.2) * 0.2
        return {
          boxShadow: `0 0 ${30 + animationPhase % 10}px rgba(251, 191, 36, ${glowIntensity})`,
        }
      }
      case 'speaking':
        // Active blue glow
        return {
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)',
        }
      case 'listening':
        // Green glow for listening
        return {
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
        }
      default:
        return {}
    }
  }

  // Get ring color based on state
  const getRingColor = () => {
    switch (state) {
      case 'idle':
        return 'ring-violet-200'
      case 'thinking':
        return 'ring-amber-300'
      case 'speaking':
        return 'ring-blue-400'
      case 'listening':
        return 'ring-green-400'
      default:
        return 'ring-violet-200'
    }
  }

  // Get status indicator
  const getStatusIndicator = () => {
    const indicatorColors = {
      idle: 'bg-gray-400',
      thinking: 'bg-amber-400',
      speaking: 'bg-blue-500',
      listening: 'bg-green-500',
    }

    const indicatorAnimation = {
      idle: '',
      thinking: 'animate-pulse',
      speaking: 'animate-bounce',
      listening: 'animate-pulse',
    }

    return (
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${indicatorColors[state]} ${indicatorAnimation[state]}`}
      />
    )
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main avatar container */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden ${ringSizes[size]} ring-offset-2 ${getRingColor()} transition-all duration-300`}
        style={{
          transform: getTransform(),
          transition: state === 'speaking' ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out',
          ...getGlowEffect(),
        }}
      >
        <img
          src={avaAvatar}
          alt="AVA"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Status indicator dot */}
      {getStatusIndicator()}

      {/* Sound waves for speaking state */}
      {state === 'speaking' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-blue-400/30"
              style={{
                width: `${100 + (animationPhase + i * 7) % 30}%`,
                height: `${100 + (animationPhase + i * 7) % 30}%`,
                opacity: 1 - ((animationPhase + i * 7) % 30) / 30,
                transition: 'all 0.1s linear',
              }}
            />
          ))}
        </div>
      )}

      {/* Ripple effect for listening state */}
      {state === 'listening' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="absolute rounded-full border-2 border-green-400/40"
            style={{
              width: `${100 + (animationPhase % 20)}%`,
              height: `${100 + (animationPhase % 20)}%`,
              opacity: 1 - (animationPhase % 20) / 20,
            }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Compact avatar for use in chat messages
 */
export function ChatAvatar({ state = 'idle' }: { state?: AvatarState }) {
  return (
    <AnimatedAvatar
      state={state}
      size="sm"
      showGlow={false}
    />
  )
}

/**
 * Typing indicator with avatar
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <AnimatedAvatar state="thinking" size="sm" showGlow />
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
