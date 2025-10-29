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
    <html lang="en" className="dark" style={{ background: '#0a0a0a', color: '#fafafa' }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.style.backgroundColor = '#0a0a0a';
              document.documentElement.style.color = '#fafafa';
              if(document.body) {
                document.body.style.backgroundColor = '#0a0a0a';
                document.body.style.color = '#fafafa';
              }
            `,
          }}
        />
      </head>
      <body className={`antialiased font-mono`} style={{ background: '#0a0a0a', color: '#fafafa' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
