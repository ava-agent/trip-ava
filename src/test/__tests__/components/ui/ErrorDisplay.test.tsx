import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorDisplay, FieldError, ErrorFallback, ErrorToast } from '@/components/ui/ErrorDisplay'

describe('ErrorDisplay Components', () => {
  describe('ErrorDisplay', () => {
    it('should render error message from string', () => {
      render(<ErrorDisplay error="Test error" />)
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('should render error message from Error object', () => {
      const error = new Error('Test error message')
      render(<ErrorDisplay error={error} />)
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should render error title', () => {
      render(<ErrorDisplay error="Test error" />)
      expect(screen.getByText('出错了')).toBeInTheDocument()
    })

    it('should not render retry button when onRetry not provided', () => {
      render(<ErrorDisplay error="Test error" />)
      expect(screen.queryByText('重试')).not.toBeInTheDocument()
    })

    it('should render retry button when onRetry provided', () => {
      const onRetry = vi.fn()
      render(<ErrorDisplay error="Test error" onRetry={onRetry} />)
      expect(screen.getByText('重试')).toBeInTheDocument()
    })

    it('should call onRetry when retry button clicked', async () => {
      const onRetry = vi.fn()
      render(<ErrorDisplay error="Test error" onRetry={onRetry} />)

      const retryButton = screen.getByText('重试')
      fireEvent.click(retryButton)

      await new Promise(resolve => setTimeout(resolve, 0))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should show retrying state while retrying', async () => {
      const onRetry = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<ErrorDisplay error="Test error" onRetry={onRetry} />)

      const retryButton = screen.getByText('重试')
      fireEvent.click(retryButton)

      // Should show "重试中..." text
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(screen.getByText('重试中...')).toBeInTheDocument()
    })

    it('should not render dismiss button when onDismiss not provided', () => {
      render(<ErrorDisplay error="Test error" />)
      // Check that X icon button is not present
      const buttons = screen.queryAllByRole('button')
      const dismissButton = buttons.find(btn => btn.querySelector('svg'))
      expect(dismissButton).toBeUndefined()
    })

    it('should render dismiss button when onDismiss provided', () => {
      const onDismiss = vi.fn()
      render(<ErrorDisplay error="Test error" onDismiss={onDismiss} />)
      // Should have a button with X icon
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should call onDismiss when dismiss button clicked', () => {
      const onDismiss = vi.fn()
      render(<ErrorDisplay error="Test error" onDismiss={onDismiss} />)

      // Find and click the X button (dismiss button)
      const buttons = screen.queryAllByRole('button')
      buttons.forEach(btn => {
        if (btn.querySelector('svg')) {
          fireEvent.click(btn)
        }
      })

      expect(onDismiss).toHaveBeenCalled()
    })

    it('should render in full screen mode', () => {
      const { container } = render(<ErrorDisplay error="Test error" fullScreen />)
      const overlay = container.querySelector('.fixed')
      expect(overlay).toBeInTheDocument()
    })
  })

  describe('FieldError', () => {
    it('should not render when error is undefined', () => {
      const { container } = render(<FieldError error={undefined} />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when error is empty string', () => {
      const { container } = render(<FieldError error="" />)
      expect(container.firstChild).toBeNull()
    })

    it('should render error message', () => {
      render(<FieldError error="Field error" />)
      expect(screen.getByText('Field error')).toBeInTheDocument()
    })

    it('should render error icon', () => {
      const { container } = render(<FieldError error="Field error" />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('ErrorFallback', () => {
    it('should render error boundary fallback', () => {
      const error = new Error('Test error')
      const resetError = vi.fn()

      render(<ErrorFallback error={error} resetError={resetError} />)

      expect(screen.getByText('出错了')).toBeInTheDocument()
      expect(screen.getByText('Test error')).toBeInTheDocument()
      expect(screen.getByText('重新加载')).toBeInTheDocument()
    })

    it('should call resetError when reload button clicked', () => {
      const error = new Error('Test error')
      const resetError = vi.fn()

      render(<ErrorFallback error={error} resetError={resetError} />)

      const reloadButton = screen.getByText('重新加载')
      fireEvent.click(reloadButton)

      expect(resetError).toHaveBeenCalledTimes(1)
    })
  })

  describe('ErrorToast', () => {
    it('should render toast notification', () => {
      const onDismiss = vi.fn()
      render(<ErrorToast error="Toast error" onDismiss={onDismiss} />)

      expect(screen.getByText('Toast error')).toBeInTheDocument()
    })

    it('should call onDismiss when dismiss button clicked', () => {
      const onDismiss = vi.fn()
      render(<ErrorToast error="Toast error" onDismiss={onDismiss} />)

      // Find and click dismiss button
      const buttons = screen.queryAllByRole('button')
      buttons.forEach(btn => {
        if (btn.querySelector('svg')) {
          fireEvent.click(btn)
        }
      })

      expect(onDismiss).toHaveBeenCalled()
    })

    it('should render in fixed position', () => {
      const onDismiss = vi.fn()
      const { container } = render(<ErrorToast error="Toast error" onDismiss={onDismiss} />)

      const toast = container.firstChild as HTMLElement
      expect(toast).toHaveClass('fixed')
    })
  })
})
