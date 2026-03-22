import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading, LoadingSpinner, AvaTyping, ContentGenerating, Skeleton, MessageSkeleton, CardSkeleton, QuickActionSkeleton } from '@/components/ui/Loading'

describe('Loading Components', () => {
  describe('Loading', () => {
    it('should render without throwing errors', () => {
      expect(() => render(<Loading />)).not.toThrow()
    })

    it('should render with custom text', () => {
      render(<Loading text="Loading..." />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render different sizes without errors', () => {
      const { rerender } = render(<Loading size="sm" />)
      expect(() => rerender(<Loading size="md" />)).not.toThrow()
      expect(() => rerender(<Loading size="lg" />)).not.toThrow()
    })

    it('should render in full screen mode', () => {
      const { container } = render(<Loading fullScreen />)
      const overlay = container.querySelector('.fixed')
      expect(overlay).toBeInTheDocument()
    })

    it('should not render text when not provided', () => {
      render(<Loading />)
      const textElements = screen.queryAllByText(/./)
      const loadingText = textElements.filter(el => el.textContent?.trim().length > 0)
      expect(loadingText.length).toBe(0)
    })
  })

  describe('LoadingSpinner', () => {
    it('should render spinner', () => {
      const { container } = render(<LoadingSpinner />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should render different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />)
      rerender(<LoadingSpinner size="md" />)
      rerender(<LoadingSpinner size="lg" />)
      // Just verify no errors thrown
      const { container } = render(<LoadingSpinner size="md" />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('AvaTyping', () => {
    it('should render typing indicator', () => {
      render(<AvaTyping />)
      expect(screen.getByText('AVA 正在思考...')).toBeInTheDocument()

      const dots = screen.getAllByRole('generic').filter(
        el => el.classList.contains('rounded-full')
      )
      expect(dots).toHaveLength(3)
    })
  })

  describe('ContentGenerating', () => {
    it('should render for note type', () => {
      render(<ContentGenerating type="note" />)
      expect(screen.getByText('正在生成旅行笔记')).toBeInTheDocument()
    })

    it('should render for poetry type', () => {
      render(<ContentGenerating type="poetry" />)
      expect(screen.getByText('正在生成诗歌')).toBeInTheDocument()
    })

    it('should render for review type', () => {
      render(<ContentGenerating type="review" />)
      expect(screen.getByText('正在生成酒店点评')).toBeInTheDocument()
    })

    it('should show AI creating message', () => {
      render(<ContentGenerating type="note" />)
      expect(screen.getByText('AI 正在为您创作精彩内容...')).toBeInTheDocument()
    })
  })

  describe('Skeleton', () => {
    it('should render with default classes', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('animate-pulse')
      expect(skeleton).toHaveClass('bg-sky-blue-100')
    })

    it('should render with custom className', () => {
      const { container } = render(<Skeleton className="h-10 w-20" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('h-10')
      expect(skeleton).toHaveClass('w-20')
    })
  })

  describe('MessageSkeleton', () => {
    it('should render message skeleton structure', () => {
      const { container } = render(<MessageSkeleton />)
      const avatar = container.querySelector('.rounded-full')
      expect(avatar).toBeInTheDocument()

      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('CardSkeleton', () => {
    it('should render card skeleton structure', () => {
      const { container } = render(<CardSkeleton />)
      const card = container.querySelector('.glass-card')
      expect(card).toBeInTheDocument()

      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('QuickActionSkeleton', () => {
    it('should render quick action skeleton structure', () => {
      const { container } = render(<QuickActionSkeleton />)
      const card = container.querySelector('.glass-card')
      expect(card).toBeInTheDocument()

      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })
})
