/**
 * Share utility for various platforms
 */

export interface ShareOptions {
  title?: string
  text: string
  url?: string
  imageUrl?: string
}

/**
 * Check if Web Share API is available
 */
export function isWebShareAvailable(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    typeof navigator.share === 'function'
  )
}

/**
 * Share using Web Share API (mobile support)
 */
export async function webShare(options: ShareOptions): Promise<boolean> {
  if (!isWebShareAvailable()) {
    return false
  }

  try {
    await navigator.share({
      title: options.title || 'AVA - 智能旅行助手',
      text: options.text,
      url: options.url || window.location.href,
    })
    return true
  } catch (error) {
    // User cancelled the share
    if (error instanceof Error && error.name === 'AbortError') {
      return true
    }
    console.error('Share failed:', error)
    return false
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const result = document.execCommand('copy')
    textArea.remove()
    return result
  } catch (error) {
    console.error('Copy failed:', error)
    return false
  }
}

/**
 * Download content as a file
 */
export function downloadAsFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Share to WeChat (requires QR code or redirect)
 */
export function shareToWeChat(options: ShareOptions): void {
  // WeChat doesn't have a direct share API for web
  // This would typically show a QR code or redirect to WeChat
  const text = encodeURIComponent(options.text)
  const url = encodeURIComponent(options.url || window.location.href)
  // Open WeDev or show instructions
  window.open(
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${url}`,
    '_blank'
  )
}

/**
 * Share to Weibo
 */
export function shareToWeibo(options: ShareOptions): void {
  const { title, text, url } = options
  const shareUrl = encodeURIComponent(url || window.location.href)
  const shareTitle = encodeURIComponent(title || text)
  window.open(
    `https://service.weibo.com/share/share.php?url=${shareUrl}&title=${shareTitle}`,
    '_blank'
  )
}

/**
 * Share to Twitter/X
 */
export function shareToTwitter(options: ShareOptions): void {
  const { text, url } = options
  const tweetText = encodeURIComponent(text)
  const tweetUrl = encodeURIComponent(url || window.location.href)
  window.open(
    `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`,
    '_blank'
  )
}

/**
 * Share to Facebook
 */
export function shareToFacebook(options: ShareOptions): void {
  const url = encodeURIComponent(options.url || window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

/**
 * Download image
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Image download failed:', error)
    return false
  }
}

/**
 * Generate share image from content (basic implementation)
 * In production, you would use a library like html2canvas
 */
export function generateShareImage(element: HTMLElement): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic implementation - just returns the data URL
    // In production, use html2canvas or similar library
    try {
      // This is a placeholder - actual implementation would use html2canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      canvas.width = 800
      canvas.height = 600

      // Fill background
      ctx.fillStyle = '#1e3a5f'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add text
      ctx.fillStyle = '#ffffff'
      ctx.font = '24px Arial'
      ctx.fillText('AVA 智能旅行助手', 50, 50)

      const dataUrl = canvas.toDataURL('image/png')
      resolve(dataUrl)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Show share menu (returns available share methods)
 */
export function getShareMethods() {
  return {
    webShare: isWebShareAvailable(),
    clipboard: true,
    download: true,
    wechat: true,
    weibo: true,
    twitter: true,
    facebook: true,
  }
}
