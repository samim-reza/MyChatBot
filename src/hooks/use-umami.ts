'use client';

import type { AnalyticsEvent } from '@/types/analytics';
import { useCallback } from 'react';

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      target: string | Date,
      params?: Record<string, string | number | boolean>,
    ) => void;
  }
}

/**
 * Hook for tracking custom analytics events.
 *
 * `trackEvent` is type-safe: the `data` payload is constrained by the `name`
 * via the `AnalyticsEvent` discriminated union, so the wrong payload for an
 * event is a compile error. Calls are no-ops when Google Analytics has not
 * loaded yet.
 *
 * @example
 * ```tsx
 * const { trackEvent } = useUmami();
 *
 * trackEvent({
 *   name: 'button_click',
 *   data: { buttonId: 'hero_cta', section: 'hero' },
 * });
 * ```
 */
export function useUmami() {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', event.name, event.data);
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }, []);

  return { trackEvent };
}
