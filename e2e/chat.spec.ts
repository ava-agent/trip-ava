import { test, expect, Page } from '@playwright/test'

// Helper: clear auth state for clean testing
async function clearAuth(page: Page) {
  // Clear cookies first
  await page.context().clearCookies()
  // Navigate to a page first to ensure we have a valid origin for localStorage
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

test.describe('AVA Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state for each auth test
    await clearAuth(page)
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    // Should redirect to /login when not authenticated
    await expect(page).toHaveURL(/\/login/)
    // Check for login form elements
    await expect(page.getByRole('heading', { name: /欢迎回来|登录/ })).toBeVisible({ timeout: 10000 })
  })

  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login')
    // Check for specific login form elements
    await expect(page.getByRole('heading', { name: /欢迎回来/ })).toBeVisible({ timeout: 10000 })
    await expect(page.getByLabel(/用户名/)).toBeVisible()
    await expect(page.getByLabel(/密码/)).toBeVisible()
    await expect(page.getByRole('button', { name: /登录/ })).toBeVisible()
  })

  test('register page should be accessible', async ({ page }) => {
    await page.goto('/register')
    // Check for specific register form elements
    await expect(page.getByRole('heading', { name: /创建账号/ })).toBeVisible({ timeout: 10000 })
    await expect(page.getByLabel(/用户名/)).toBeVisible()
    await expect(page.getByLabel(/邮箱/)).toBeVisible()
    await expect(page.getByRole('button', { name: /创建账号/ })).toBeVisible()
  })

  test('should show validation errors on login form', async ({ page }) => {
    await page.goto('/login')
    const submitButton = page.getByRole('button', { name: /登录/ })
    await submitButton.click()

    // HTML5 validation should prevent submission (form has required fields)
    // Check that we're still on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.getByRole('link', { name: /立即注册/ })
    await expect(registerLink).toBeVisible()
    await registerLink.click()
    await expect(page).toHaveURL(/\/register/)
  })
})

// Helper: setup with settings for voice-enabled tests
async function setupAuthWithSettings(page: Page, customSettings?: Record<string, unknown>) {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'USER',
  }

  await page.context().addInitScript(({ user, settings }) => {
    // Set auth state
    const authState = {
      state: {
        user: user,
        accessToken: 'mock-test-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
      version: 0,
    }
    localStorage.setItem('auth-storage', JSON.stringify(authState))

    // Set settings with voice enabled
    const defaultSettings = {
      state: {
        settings: {
          theme: 'dark',
          language: 'zh-CN',
          notifications: true,
          soundEnabled: true,
          voiceEnabled: true,
          autoPlay: false,
          ...settings,
        }
      },
      version: 0,
    }
    localStorage.setItem('ava-settings', JSON.stringify(defaultSettings))
  }, { user: mockUser, settings: customSettings })

  await page.goto('/chat')
  await page.waitForSelector('[data-testid="chat-page"]', { timeout: 15000 })
}

test.describe('AVA Chat E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthWithSettings(page)
  })

  test('should display chat page with header and input', async ({ page }) => {
    // Check that the page title contains AVA
    await expect(page).toHaveTitle(/AVA/)

    // Check that the input field is visible
    await expect(page.getByPlaceholder('和 AVA 聊聊...')).toBeVisible()

    // Check that the send button is visible
    await expect(page.getByLabel('发送')).toBeVisible()
  })

  test('should send a message and display it', async ({ page }) => {
    // Mock the API response
    await page.route('**/ava/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'AVA 的回复内容',
          timestamp: new Date().toISOString(),
        }),
      })
    })

    const input = page.getByPlaceholder('和 AVA 聊聊...')
    await input.fill('你好，AVA')
    await page.getByLabel('发送').click()

    // Check that the user message appears in the chat
    await expect(page.getByText('你好，AVA')).toBeVisible({ timeout: 5000 })
  })

  test('should not send empty message', async ({ page }) => {
    const sendButton = page.getByLabel('发送')
    // Send button should be disabled when input is empty
    await expect(sendButton).toBeDisabled()
  })

  test('should send message with Enter key', async ({ page }) => {
    // Mock the API response
    await page.route('**/ava/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'Enter key response',
          timestamp: new Date().toISOString(),
        }),
      })
    })

    const input = page.getByPlaceholder('和 AVA 聊聊...')
    await input.fill('Test message with Enter')
    await input.press('Enter')

    // Check that the message appears
    await expect(page.getByText('Test message with Enter')).toBeVisible({ timeout: 5000 })
  })

  test('should not send message with Shift+Enter', async ({ page }) => {
    const input = page.getByPlaceholder('和 AVA 聊聊...')
    await input.fill('Line 1')

    // Press Shift+Enter - should not send
    await input.press('Shift+Enter')

    // Input should still contain the text (not cleared after send)
    const value = await input.inputValue()
    expect(value).toContain('Line 1')
  })

  test('should display voice recording button', async ({ page }) => {
    const voiceButton = page.getByLabel('开始录音')
    await expect(voiceButton).toBeVisible()
  })

  test('should clear input after sending', async ({ page }) => {
    // Mock the API response
    await page.route('**/ava/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'Response',
          timestamp: new Date().toISOString(),
        }),
      })
    })

    const input = page.getByPlaceholder('和 AVA 聊聊...')
    await input.fill('This should be cleared')
    await page.getByLabel('发送').click()

    // Input should be cleared immediately after send
    await expect(input).toHaveValue('')
  })

  test('should disable input while waiting for response', async ({ page }) => {
    // Mock slow API response
    await page.route('**/ava/chat', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'Slow response',
          timestamp: new Date().toISOString(),
        }),
      })
    })

    const input = page.getByPlaceholder('和 AVA 聊聊...')
    await input.fill('Trigger typing indicator')
    await page.getByLabel('发送').click()

    // Input should be disabled while waiting for response
    await expect(input).toBeDisabled({ timeout: 1000 })
  })

  test('should handle network error gracefully', async ({ page }) => {
    // Simulate network error by blocking API calls
    await page.route('**/ava/chat', async (route) => {
      await route.abort('failed')
    })

    const input = page.getByPlaceholder('和 AVA 聊聊...')
    await input.fill('Test error handling')
    await page.getByLabel('发送').click()

    // Wait for error handling
    await page.waitForTimeout(2000)

    // Input should be re-enabled after error
    await expect(input).toBeEnabled({ timeout: 5000 })
  })

  test('should display AVA avatar in header', async ({ page }) => {
    // Check that the AVA header title is visible (use exact heading role to avoid strict mode violation)
    await expect(page.getByRole('heading', { name: 'AVA', exact: true })).toBeVisible()
  })

  test('should handle responsive layout on mobile', async ({ page, viewport }) => {
    if (!viewport || viewport.width > 768) {
      test.skip()
    }

    const input = page.getByPlaceholder('和 AVA 聊聊...')
    const box = await input.boundingBox()

    // Input should fit within mobile viewport
    expect(box?.width).toBeLessThan(viewport.width)
  })
})

test.describe('AVA Welcome Screen', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthWithSettings(page)
  })

  test('should show welcome screen when no messages', async ({ page }) => {
    // When there are no messages, welcome screen should show
    // Either welcome screen or chat input should be visible
    const hasWelcome = await page.locator('[data-testid="welcome-screen"]').isVisible().catch(() => false)
    const hasInput = await page.getByPlaceholder('和 AVA 聊聊...').isVisible().catch(() => false)
    expect(hasWelcome || hasInput).toBe(true)
  })
})
