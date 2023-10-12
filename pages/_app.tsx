import { Inter } from 'next/font/google'
import './globals.css'

import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function MyApp({ Component, pageProps }: AppProps) {
    return <div className={inter.className}>
        <SessionProvider session={pageProps.session}>
            <Link href={"api/auth/signin"}>
                Sign In
            </Link>
            <Component {...pageProps} />
        </SessionProvider>
    </div>
}