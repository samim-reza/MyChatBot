'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

const DEFAULT_GA_ID = 'G-1K5RBXN9QK';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: 'event' | 'config' | 'js',
      target: string | Date,
      params?: Record<string, string | number | boolean>,
    ) => void;
  }
}

function pageUrl(pathname: string) {
  if (typeof window === 'undefined') {
    return pathname;
  }

  const query = window.location.search;
  return query ? `${pathname}${query}` : pathname;
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_ID || DEFAULT_GA_ID;

  useEffect(() => {
    if (!pathname || typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('config', gaId, {
      page_path: pageUrl(pathname),
      page_title: document.title,
    });
  }, [gaId, pathname]);

  return (
    <>
      <Script
        id="google-analytics"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
