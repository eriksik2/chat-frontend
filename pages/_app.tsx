import { Inter } from 'next/font/google'
import './globals.css'

import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export default function MyApp({ Component, pageProps }: AppProps) {
    return <div className={inter.className}>
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
    </div>
}