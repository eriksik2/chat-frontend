import Link from "next/link";
import { useApiGET } from "@/api/fetcher";
import { ApiChatLatestGETResponse } from "../api/chats/latest";
import Chat from "@/components/chat/Chat";
import ChatPage from "./[chat]";
import { useRouter } from "next/router";
import { ApibotGETResponse } from "../api/bots/[bot]";
import { ApiBotStatsGETResponse } from "../api/bots/[bot]/stats";
import { ChatBotCard } from "@/components/chatbot/ChatBotCard";

export type ChatsPageQuery = {
    chatbot?: string;
}

export default function ChatsPage() {
    const router = useRouter();
    const { chatbot } = router.query as ChatsPageQuery;
    const { data, error, reloading } = useApiGET<ApiChatLatestGETResponse>("/api/chats/latest");

    const loading = data === undefined && reloading;
    if (loading) return null;
    if (error !== null && error.status === 401) return <LogInPrompt chatbot={chatbot} />;
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



type LogInPromptProps = {
    chatbot?: string;
};

function LogInPrompt(props: LogInPromptProps) {
    const { data: chatbotStats, error: statsError, reloading: statsReloading } = useApiGET<ApiBotStatsGETResponse>(props.chatbot ? `/api/bots/${props.chatbot}/stats` : null);
    const { data: chatbot, error, reloading } = useApiGET<ApibotGETResponse>(props.chatbot ? `/api/bots/${props.chatbot}` : null);

    return <div className="h-full flex flex-col justify-center items-center">

        {chatbot !== undefined && <div className="pb-24 flex flex-col items-center gap-4">
            <p className="text-xl">Want to chat with {chatbot.name}?</p>
            <ChatBotCard
                id={chatbot.id}
            />
            {chatbotStats !== undefined && <p>
                {chatbotStats.chats} {chatbotStats.chats === 1 ? "person is" : "people are"} chatting with it right now.
            </p>}
        </div>}

        <p className="text-4xl">Log in to access chat.</p>
        <br />
        <p>You can <Link href="/api/auth/signin" className="text-blue-500 hover:underline visited:text-purple-600">click here</Link> to log in using Google.</p>
        <p>Or click the button on the top right.</p>
        <br />
        <p>We will never send you an email and we won{"'"}t use any of your personal data.</p>
    </div>;
}