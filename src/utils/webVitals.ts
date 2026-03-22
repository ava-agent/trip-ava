import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * Web Vitals thresholds (Good/Needs Improvement/Poor)
 * FID replaced by INP in Core Web Vitals 2024
 */
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

type ThresholdKey = keyof typeof THRESHOLDS

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as ThresholdKey]
  if (!threshold) return 'good'
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

function reportMetric(metric: Metric) {
  const rating = getRating(metric.name, metric.value)
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn(
      `[Web Vitals] ${emoji} ${metric.name}: ${Math.round(metric.value)}${
        metric.name === 'CLS' ? '' : 'ms'
      } (${rating})`
    )
  }

  // Send to analytics endpoint in production
  if (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_URL) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
      url: window.location.href,
    })

    // Use sendBeacon for reliability during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(import.meta.env.VITE_ANALYTICS_URL, body)
    } else {
      fetch(import.meta.env.VITE_ANALYTICS_URL, {
        body,
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        // Silently fail - analytics should not break the app
      })
    }
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this once when the app starts
 */
export function initWebVitals() {
  onCLS(reportMetric)
  onFCP(reportMetric)
  onINP(reportMetric)
  onLCP(reportMetric)
  onTTFB(reportMetric)
}

export type { Metric }
