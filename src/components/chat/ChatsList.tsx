import App from "@/state/App";
import { ApiChatsResponseData } from "../../../pages/api/chats";
import Link from "next/link";
import useSWR, { preload } from "swr";

type ChatsListProps = {
    app: App;
};

export default function ChatsList(props: ChatsListProps) {
    const data = useSWR("/api/chats", (url: string) => fetch(url).then(res => res.json() as Promise<ApiChatsResponseData>));
    const chats = data.data;
    const loading = data.isLoading;

    // TODO better loading and null handling
    if (loading) return <div>Loading...</div>;
    if (chats === null) return <div>Chats not found.</div>;

    return <div>
        <h1 className="text-2xl">Chats</h1>
        <div className="flex flex-col gap-2">
            {chats!.map((chat) => {
                preload(`/api/chat/${chat.id}`, url => fetch(url).then(res => res.json()));
                return <Link key={chat.id} href={`/chat/${chat.id}`}>
                    <div className="bg-slate-400">
                        {chat.name}
                    </div>
                </Link>;
            })}
        </div>
    </div>
}