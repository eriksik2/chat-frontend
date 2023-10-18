import { Inter } from "next/font/google";
import "./globals.css";

import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import clsx from "clsx";
import RootLayout from "@/components/Layout/RootLayout";

import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
  const getLayout =
    (Component as any).getLayout ?? ((page: JSX.Element) => page);

  return (
    <div
      className={clsx(
        inter.className,
        "relative h-screen w-screen",
        "bg-gradient-to-br from-slate-300/50 via-slate-100 to-slate-300/75 shadow-inner",
      )}
    >
      <SessionProvider session={pageProps.session}>
        <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>
      </SessionProvider>
      <Analytics />
    </div>
  );
}
