import { ReactElement, ReactNode } from "react";
import { useRouter } from "next/router";
import clsx from "clsx";
import BotsPage from "../bots";
import TabsLayout from "@/components/Layout/TabsLayout";
import { ApiChatsGETResponse } from "../api/chats";
import Chat from "@/components/chat/Chat";
import { useApiGET } from "@/api/fetcher";
import Link from "next/link";
import { FaTrash } from "react-icons/fa6";
import { preload, useSWRConfig } from "swr";
import { trpc } from "@/util/trcp";

type ChatPageProps = {};

export default function ChatPage(props: ChatPageProps) {
  const router = useRouter();
  // TODO null handling
  if (typeof router.query.chat !== "string") return null;
  return <Chat id={router.query.chat} />;
}

function ChatButtonBuilder({
  name,
  icon,
  route,
}: {
  name: string;
  icon: ReactNode;
  route: string;
}) {
  const router = useRouter();
  const swr = useSWRConfig();
  const active = router.asPath.includes(route);
  preload(`${route}`, (url) => fetch(url).then((res) => res.json()));
  return (
    <Link
      href={route}
      className={clsx(
        "flex w-full flex-row items-center justify-between gap-2 bg-gradient-to-br p-2 shadow-inner",
        active
          ? "from-slate-500/50 via-slate-400 to-slate-500/75"
          : "from-slate-400/50 via-slate-300 to-slate-400/75",
        "hover:bg-gradient-to-br hover:from-slate-500/50 hover:via-slate-400 hover:to-slate-500/75",
      )}
    >
      <span className="flex flex-row gap-2">
        <span>{icon}</span>
        <span>{name}</span>
      </span>
      <button
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const response = await fetch(`/api${route}`, {
            method: "DELETE",
          });
          swr.mutate("/api/chats");
          router.replace("/api/chats/latest?redirect=true");
        }}
      >
        <FaTrash />
      </button>
    </Link>
  );
}

function ChatPageLayout(props: { page: ReactElement }) {
  const { data, isInitialLoading, error } = trpc.chats.all.useQuery();
  const chats = data?.chats;
  const loading = isInitialLoading;

  // TODO better loading and null handling
  if (error !== null) {
    console.error("Error while loading chats side bar: ", error.message);
    return props.page;
  }

  if ((chats ?? []).length === 0) return props.page;

  return (
    <TabsLayout
      tabsLocation="right"
      tabsGap="0"
      tabBarWidth="17rem"
      scrollable={true}
      before={
        <div className="p-1 pt-12">
          <h2 className="text-2xl">Your chats</h2>
        </div>
      }
      after={<div className="p-1 pt-12"></div>}
      pages={(chats ?? []).map((chat) => {
        return {
          name: chat.name ?? "Chat",
          route: `/chats/${chat.id}`,
          icon: "🤖",
        };
      })}
      buttonBuilder={ChatButtonBuilder}
    >
      {props.page}
    </TabsLayout>
  );
}

ChatPage.getLayout = function getLayout(page: ReactElement) {
  return <ChatPageLayout page={page} />;
};
