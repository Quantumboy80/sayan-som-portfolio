import UmamiAnalytics from '@/components/analytics/UmamiAnalytics';
import ChatBubble from '@/components/common/ChatBubble';
import Footer from '@/components/common/Footer';
import Navbar from '@/components/common/Navbar';
import OnekoCat from '@/components/common/OnekoCat';
import { Quote } from '@/components/common/Quote';
import { ThemeProvider } from '@/components/common/ThemeProviders';
import { generateMetadata as getMetadata, siteConfig } from '@/config/Meta';
import ReactLenis from 'lenis/react';
import { ViewTransitions } from 'next-view-transitions';
import TransitionErrorCatcher from '@/components/common/TransitionErrorCatcher';
import NowPlaying from '@/components/common/NowPlaying';
 
import './globals.css';
 
export const metadata = getMetadata('/');
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const handleRejection = (event) => {
                    const reason = event.reason;
                    if (
                      reason &&
                      (reason.name === 'AbortError' ||
                        reason.message?.includes('Transition was aborted') ||
                        String(reason).includes('Transition was aborted'))
                    ) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  };
                  const handleError = (event) => {
                    const error = event.error;
                    if (
                      error &&
                      (error.name === 'AbortError' ||
                        error.message?.includes('Transition was aborted') ||
                        String(error).includes('Transition was aborted'))
                    ) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  };
                  window.addEventListener('unhandledrejection', handleRejection, true);
                  window.addEventListener('error', handleError, true);
                })();
              `,
            }}
          />
        </head>
        <body className={`font-hanken-grotesk antialiased`}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                "name": siteConfig.author.name,
                "url": siteConfig.url,
                "sameAs": [
                  `https://github.com/${siteConfig.author.github}`,
                  `https://linkedin.com/in/${siteConfig.author.linkedin}`,
                  "https://leetcode.com/u/sayanHQR004/",
                  "https://gssoc.girlscript.org/profile/fdd16455-ec38-4292-944f-4b2c66283b00"
                ],
                "email": siteConfig.author.email,
                "jobTitle": "Full Stack Software Engineer",
                "description": siteConfig.description,
              }),
            }}
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactLenis root>
              <TransitionErrorCatcher />
              <Navbar />
              {children}
              <OnekoCat />
              <Quote />
              <Footer />
              <NowPlaying />
              <ChatBubble />
              <UmamiAnalytics />
            </ReactLenis>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
