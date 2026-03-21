import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UC Admissions by High School',
  description: 'UC admissions data by California high school, 1994–2025.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9PW2YBH8Q"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-V9PW2YBH8Q');
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
