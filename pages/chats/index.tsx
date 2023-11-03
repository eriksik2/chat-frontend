import Link from "next/link";
import ChatPage from "./[chat]";
import { useRouter } from "next/router";
import { ChatBotCard } from "@/components/chatbot/ChatBotCard";
import { trpc } from "@/util/trcp";
import { useEffect } from "react";

export type ChatsPageQuery = {
  chatbot?: string;
};

export default function ChatsPage() {
  const router = useRouter();
  const { chatbot } = router.query as ChatsPageQuery;
  const { data, error, isInitialLoading } = trpc.chats.newest.useQuery();

  useEffect(() => {
    if (data?.id) {
      router.replace(`/chats/${data.id}`);
    }
  }, [data?.id]);

  if (isInitialLoading) return null;
  if (error?.data?.code === "UNAUTHORIZED")
    return <LogInPrompt chatbot={chatbot} />;

  if (!data?.id) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-2xl">You do not have any chats yet.</p>
        <br />
        <p>
          Go to{" "}
          <Link
            href="/bots"
            className="text-blue-500 visited:text-purple-600 hover:underline"
          >
            Chatbots
          </Link>{" "}
          to create one.
        </p>
      </div>
    );
  }

  return null;
  /*return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="text-2xl">Select a chat from the sidebar.</p>
      <br />
      <p>
        Or go to{" "}
        <Link
          href="/bots"
          className="text-blue-500 visited:text-purple-600 hover:underline"
        >
          Chatbots
        </Link>{" "}
        page to create a new one.
      </p>
    </div>
  );*/
}

ChatsPage.getLayout = ChatPage.getLayout;

type LogInPromptProps = {
  chatbot?: string;
};

function LogInPrompt(props: LogInPromptProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      {props.chatbot !== undefined && (
        <ChatBotCardWithCount chatbot={props.chatbot} />
      )}

      <p className="text-4xl">Log in to access chat.</p>
      <br />
      <p>
        You can{" "}
        <Link
          href="/api/auth/signin"
          className="text-blue-500 visited:text-purple-600 hover:underline"
        >
          click here
        </Link>{" "}
        to log in using Google.
      </p>
      <p>Or click the button on the top right.</p>
      <br />
      <p>
        We will never send you an email and we won{"'"}t use any of your
        personal data.
      </p>
    </div>
  );
}

type ChatBotCardWithCountProps = {
  chatbot: string;
};

function ChatBotCardWithCount(props: ChatBotCardWithCountProps) {
  const {
    data: chatbotStats,
    error: statsError,
    isInitialLoading: statsLoading,
  } = trpc.bots.getNumberOfChats.useQuery({
    chatbotId: props.chatbot,
  });

  return (
    <div className="flex flex-col items-center gap-4 pb-14 text-start sm:pb-24">
      <ChatBotCard id={props.chatbot} />
      {chatbotStats !== undefined && (
        <p>
          {chatbotStats.count} {chatbotStats.count === 1 ? "person" : "people"}{" "}
          chatting right now.
        </p>
      )}
    </div>
  );
}
