import type { Metadata } from 'next';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "Olivia | Privacy-First Prediction Markets",
  description:
    "Experience Olivia, the prediction market of the future — seamlessly powered by Arcium — the transparent layer for private prediction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #0a0a0a !important;
                color: #fafafa !important;
                margin: 0;
                padding: 0;
              }
              body {
                opacity: 1;
                transition: opacity 0.3s ease-in-out;
              }
              body.page-ready {
                opacity: 1;
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (document.documentElement) {
                    document.documentElement.setAttribute('data-hydrated', 'true');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased font-mono" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
