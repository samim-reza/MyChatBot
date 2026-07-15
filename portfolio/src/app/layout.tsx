import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import ChatBubble from '@/components/common/ChatBubble';
import Footer from '@/components/common/Footer';
import Navbar from '@/components/common/Navbar';
import OnekoCat from '@/components/common/OnekoCat';
import { Quote } from '@/components/common/Quote';
import { ThemeProvider } from '@/components/common/ThemeProviders';
import { Toaster } from '@/components/ui/sonner';
import { generateMetadata as getMetadata, siteConfig } from '@/config/Meta';
import ReactLenis from 'lenis/react';

import './globals.css';

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
    <html lang="en" suppressHydrationWarning>
      <body className={`font-hanken-grotesk antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactLenis root>
            <Navbar />
            {children}
            <OnekoCat />
            <Quote />
            <Footer />
            <ChatBubble />
            <Toaster />
            <GoogleAnalytics />
          </ReactLenis>
        </ThemeProvider>
      </body>
    </html>
  );
}
