import { Inter } from 'next/font/google'
import './globals.css'

import type { AppProps } from 'next/app'

const inter = Inter({ subsets: ['latin'] })

export default function MyApp({ Component, pageProps }: AppProps) {
    return <div className={inter.className}>
        <Component {...pageProps} />
    </div>
}