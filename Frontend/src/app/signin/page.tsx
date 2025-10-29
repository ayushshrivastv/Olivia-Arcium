'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="grid w-screen min-h-screen max-w-[1600px] gap-4 self-center bg-background px-6 lg:px-20">
      <header className="h-[4.5rem] grid w-full items-center bg-background">
        <nav className="flex items-center justify-between" aria-label="Global">
          <Link
            href="/"
            className="flex items-center"
            tabIndex={-1}
            title="Olivia | Privacy-First Prediction Markets"
          >
            <Image src={'/logo.png'} height={54} width={54} alt={'logo'} />
          </Link>
        </nav>
      </header>

      <div className="hide-scrollbar min-h-[calc(100vh-7rem)]">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex justify-center">
            <div className="container mx-auto flex max-w-[646px] flex-col">
              <div className="flex flex-col gap-6 p-8 bg-card rounded-2xl border border-border">
                <h3 className="text-3xl font-bold mb-4">
                  Welcome to Olivia
                </h3>
                <p className="text-muted-foreground mb-6">
                  Sign in to start trading on prediction markets
                </p>

                <div className="grid w-full">
                  <button
                    className="py-4 justify-center items-center border whitespace-nowrap outline-none rounded-2xl border-border transition-all duration-250 hover:opacity-90 bg-primary text-primary-foreground"
                    onClick={async () => {
                      await signIn('credentials', {
                        callbackUrl: '/',
                        email: 'demo@olivia.com',
                      });
                    }}
                  >
                    <span className="flex-1">Continue with Demo Account</span>
                  </button>
                </div>

                <div className="font-small flex flex-col items-center justify-start text-muted-foreground text-sm">
                  <span>
                    By continuing you agree with our{' '}
                    <Link
                      href="/"
                      target="_blank"
                      className="text-foreground underline"
                    >
                      Terms of Service
                    </Link>
                    ,{' '}
                    <Link
                      href="/"
                      target="_blank"
                      className="text-foreground underline"
                    >
                      Privacy Policy
                    </Link>
                    , and our{' '}
                    <Link
                      href="/"
                      target="_blank"
                      className="text-foreground underline"
                    >
                      Risk Disclosure.
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
