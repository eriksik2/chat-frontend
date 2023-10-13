import App from "@/state/App";
import { ApiChatsResponseData } from "../../../pages/api/chats";
import Link from "next/link";
import useSWR, { preload } from "swr";

type ChatsListProps = {
};

export default function ChatsList(props: ChatsListProps) {
    const data = useSWR("/api/chats", (url: string) => fetch(url).then(res => res.json() as Promise<ApiChatsResponseData>));
    const chats = data.data;
    const reloading = data.isLoading;
    const loading = chats === null && reloading;
    const noChats = chats === null && !reloading;

    // TODO better loading and null handling
    if (noChats) {
        console.error("No chats found.");
        return null;
    }

    return <div>
        <h1 className="text-2xl">Chats</h1>
        <div className="flex flex-col gap-2">
            {loading && <div>Loading...</div>}
            {(chats ?? []).map((chat) => {
                preload(`/api/chats/${chat.id}`, url => fetch(url).then(res => res.json()));
                return <Link key={chat.id} href={`/chats/${chat.id}`}>
                    <div className="bg-slate-400">
                        {chat.name}
                    </div>
                </Link>;
            })}
        </div>
    </div>
}