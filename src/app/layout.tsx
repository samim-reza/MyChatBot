import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import Footer from '@/components/common/Footer';
import Navbar from '@/components/common/Navbar';
import OnekoCat from '@/components/common/OnekoCat';
import { Quote } from '@/components/common/Quote';
import SiteChatBubble from '@/components/common/SiteChatBubble';
import { ThemeProvider } from '@/components/common/ThemeProviders';
import WelcomeGreeting from '@/components/common/WelcomeGreeting';
import { Toaster } from '@/components/ui/sonner';
import { generateMetadata as getMetadata, siteConfig } from '@/config/Meta';
import ReactLenis from 'lenis/react';
import { Geist_Mono, Schibsted_Grotesk } from 'next/font/google';

import './globals.css';

const sans = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-schibsted',
  display: 'swap',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata = getMetadata('/');

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: siteConfig.author.name,
  url: siteConfig.url,
  email: `mailto:${siteConfig.author.email}`,
  jobTitle: 'Senior AI Software Engineer',
  sameAs: [
    `https://github.com/${siteConfig.author.github}`,
    `https://www.linkedin.com/in/${siteConfig.author.linkedin}`,
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactLenis root>
            <Navbar />
            {children}
            <OnekoCat />
            <Quote />
            <Footer />
            <SiteChatBubble />
            <WelcomeGreeting />
            <Toaster />
            <GoogleAnalytics />
          </ReactLenis>
        </ThemeProvider>
      </body>
    </html>
  );
}
