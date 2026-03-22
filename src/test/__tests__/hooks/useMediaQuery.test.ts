import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

describe('useMediaQuery', () => {
  // Mock window.matchMedia
  const mockMatchMedia = vi.fn()
  type MediaQueryListener = (event: MediaQueryListEvent) => void

  let mockMediaQueryList: {
    matches: boolean
    addListener: (callback: MediaQueryListener) => void
    removeListener: (callback: MediaQueryListener) => void
    addEventListener: (event: string, callback: MediaQueryListener) => void
    removeEventListener: (event: string, callback: MediaQueryListener) => void
    dispatchEvent: (event: Event) => boolean
  }

  let listeners: Map<string, Set<MediaQueryListener>>

  beforeEach(() => {
    // Reset mocks and listeners
    mockMatchMedia.mockClear()
    listeners = new Map()

    // Reset mock with proper event handling
    mockMediaQueryList = {
      matches: false,
      addListener: vi.fn((callback: MediaQueryListener) => {
        if (!listeners.has('change')) {
          listeners.set('change', new Set())
        }
        listeners.get('change')!.add(callback)
      }),
      removeListener: vi.fn((callback: MediaQueryListener) => {
        listeners.get('change')?.delete(callback)
      }),
      addEventListener: vi.fn((event: string, callback: MediaQueryListener) => {
        if (!listeners.has(event)) {
          listeners.set(event, new Set())
        }
        listeners.get(event)!.add(callback)
      }),
      removeEventListener: vi.fn((event: string, callback: MediaQueryListener) => {
        listeners.get(event)?.delete(callback)
      }),
      dispatchEvent: vi.fn((event: Event) => {
        const eventListeners = listeners.get(event.type)
        if (eventListeners) {
          eventListeners.forEach(listener => {
            listener(event as MediaQueryListEvent)
          })
        }
        return true
      })
    }

    mockMatchMedia.mockReturnValue(mockMediaQueryList)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    listeners.clear()
  })

  it('should initialize with false', () => {
    mockMediaQueryList.matches = false
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('should initialize with true if media query matches', () => {
    mockMediaQueryList.matches = true
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('should call matchMedia with provided query', () => {
    renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)')
  })

  it('should add listener on mount', () => {
    renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should remove listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    unmount()
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should update matches when media query changes', () => {
    mockMediaQueryList.matches = false
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    expect(result.current).toBe(false)

    // Simulate media query change
    act(() => {
      const listener = (mockMediaQueryList.addEventListener as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]?.[1] as (() => void) | undefined
      if (listener) {
        mockMediaQueryList.matches = true
        listener()
      }
    })

    expect(result.current).toBe(true)
  })

  it('should handle different query strings', () => {
    const { rerender } = renderHook(
      (props) => useMediaQuery(props.query),
      { initialProps: { query: '(max-width: 768px)' } }
    )

    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)')

    rerender({ query: '(min-width: 1024px)' })

    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)')
  })

  it('should properly clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    // Verify listener was added
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    // Unmount and verify cleanup
    unmount()
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should handle media query changes via dispatchEvent', () => {
    mockMediaQueryList.matches = false
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    expect(result.current).toBe(false)

    // Simulate media query change using dispatchEvent
    act(() => {
      mockMediaQueryList.matches = true
      const changeEvent = new Event('change') as MediaQueryListEvent
      Object.defineProperty(changeEvent, 'matches', { value: true })
      mockMediaQueryList.dispatchEvent(changeEvent)
    })

    expect(result.current).toBe(true)
  })

  it('should handle complex media queries', () => {
    const complexQuery = '(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)'
    mockMediaQueryList.matches = true

    const { result } = renderHook(() => useMediaQuery(complexQuery))

    expect(mockMatchMedia).toHaveBeenCalledWith(complexQuery)
    expect(result.current).toBe(true)
  })

  it('should maintain separate state for different queries', () => {
    // First hook - mobile query
    mockMediaQueryList.matches = true
    const { result: mobileResult } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    // Change mock for second hook - desktop query
    mockMediaQueryList.matches = false

    const { result: desktopResult } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

    // Both hooks should have their own state
    expect(mobileResult.current).toBe(true)
    expect(desktopResult.current).toBe(false)
  })
})
