import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

describe('useMediaQuery', () => {
  // Mock window.matchMedia
  const mockMatchMedia = vi.fn()
  let mockMediaQueryList: {
    matches: boolean
    addListener: any
    removeListener: any
    addEventListener: any
    removeEventListener: any
  }

  beforeEach(() => {
    // Reset mock
    mockMediaQueryList = {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    mockMatchMedia.mockReturnValue(mockMediaQueryList)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
    expect(mockMediaQueryList.addListener).toHaveBeenCalled()
  })

  it('should remove listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    unmount()
    expect(mockMediaQueryList.removeListener).toHaveBeenCalled()
  })

  it('should update matches when media query changes', () => {
    mockMediaQueryList.matches = false
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    expect(result.current).toBe(false)

    // Simulate media query change
    act(() => {
      const listener = mockMediaQueryList.addListener.mock.calls[0]?.[0]
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
})
