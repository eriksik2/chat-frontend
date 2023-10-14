import Link from "next/link";
import { useApiGET } from "@/api/fetcher";
import { ApiChatLatestGETResponse } from "../api/chats/latest";
import Chat from "@/components/chat/Chat";
import ChatPage from "./[chat]";


export default function ChatsPage() {
    const { data, error, reloading } = useApiGET<ApiChatLatestGETResponse>("/api/chats/latest");

    const loading = data === undefined && reloading;

    if (loading) return null;
    if (error !== null) return <div>
        <h1 className="text-2xl">Error</h1>
        <div>{error.status}</div>
        <div>{error.message}</div>
    </div>;

    if (data === null) {
        return <div className="h-full flex flex-col justify-center items-center">
            <p className="text-2xl">You do not have any chats yet.</p>
            <br />
            <p>Go to <Link href="/bots" className="text-blue-500 hover:underline visited:text-purple-600">Chatbots</Link> to create one.</p>
        </div>;
    }

    return <div className="h-full flex flex-col justify-center items-center">
        <p className="text-2xl">Select a chat from the sidebar.</p>
        <br />
        <p>Or go to <Link href="/bots" className="text-blue-500 hover:underline visited:text-purple-600">Chatbots</Link> page to create a new one.</p>
    </div>;
}

ChatsPage.getLayout = ChatPage.getLayout;