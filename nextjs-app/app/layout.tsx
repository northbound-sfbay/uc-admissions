import type { Metadata } from 'next'
import './globals.css'
import GrowthAnalytics from '@/components/GrowthAnalytics'
import AdScript from '@/components/AdScript'

export const metadata: Metadata = {
  title: 'UC Admissions by High School',
  description: 'UC admissions data by California high school, 1994–2025.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const analyticsInDev = process.env.NEXT_PUBLIC_ENABLE_GA_IN_DEV === 'true'
  const enableAnalytics =
    process.env.NODE_ENV === 'production' ||
    analyticsInDev
  const gtagConfigExtras = analyticsInDev
    ? ", { debug_mode: true }"
    : ""

  return (
    <html lang="en">
      <head>
        {enableAnalytics && (
          <>
            <script dangerouslySetInnerHTML={{ __html: `
              if (['collegeacceptance.info', 'www.collegeacceptance.info'].includes(window.location.hostname) || ${analyticsInDev}) {
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){dataLayer.push(arguments);};
              gtag('js', new Date());
              gtag('config', 'G-V9PW2YBH8Q'${gtagConfigExtras});
              gtag('config', 'G-WC3LKM6FL4'${gtagConfigExtras});
              var analyticsScript = document.createElement('script');
              analyticsScript.async = true;
              analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-V9PW2YBH8Q';
              document.head.appendChild(analyticsScript);
              }
            `}} />
          </>
        )}
      </head>
      <body>{children}<GrowthAnalytics />{enableAnalytics && <AdScript />}</body>
    </html>
  )
}
