import { Inter } from 'next/font/google'
import './globals.css'

import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import Link from 'next/link'
import clsx from 'clsx'

const inter = Inter({ subsets: ['latin'] })

export default function MyApp({ Component, pageProps }: AppProps) {

    const getLayout = (Component as any).getLayout ?? ((page: JSX.Element) => page);

    return <div className={clsx(
        inter.className,
        'relative h-screen w-screen'
    )}>
        <SessionProvider session={pageProps.session}>
            {getLayout(<Component {...pageProps} />)}
        </SessionProvider>
    </div>
}