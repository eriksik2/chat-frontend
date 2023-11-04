import { Inter } from "next/font/google";
import "./globals.css";

import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import clsx from "clsx";
import RootLayout from "@/components/Layout/RootLayout";

import { Analytics } from "@vercel/analytics/react";
import { trpc } from "@/util/trcp";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout =
    (Component as any).getLayout ?? ((page: JSX.Element) => page);

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.svg" />
        <title key="title">Chat Labs</title>
        <meta
          key="keywords"
          name="keywords"
          content={`chat, chatgpt, ai, gpt, gpt3, gpt-3, chatbot, chatbots, gpt4, gpt-4, chatgpt4`}
        />
        <meta
          key="description"
          name="description"
          content="Chat Labs lets you create your own AIs, chat with them, and share them."
        />

        <link rel="canonical" href="https://chatlabs.me/" />
      </Head>
      <div
        className={clsx(
          inter.className,
          "relative h-screen w-screen",
          "bg-white",
          "dark:text-black",
        )}
      >
        <SessionProvider session={pageProps.session}>
          <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>
        </SessionProvider>
        <Analytics />
      </div>
    </>
  );
}

export default trpc.withTRPC(MyApp);
