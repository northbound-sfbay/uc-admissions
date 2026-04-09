import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UC Admissions by High School',
  description: 'UC admissions data by California high school, 1994–2025.',
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
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9PW2YBH8Q"></script>
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-V9PW2YBH8Q'${gtagConfigExtras});
              gtag('config', 'G-WC3LKM6FL4'${gtagConfigExtras});
            `}} />
            <script type="text/javascript" async data-noptimize="1" data-cfasync="false" src="//scripts.scriptwrapper.com/tags/aa59193f-60f2-447a-8f32-c32465b3f92b.js" />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
