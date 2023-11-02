import { useState, useEffect, useRef } from "react";
import ChatMessageComponent, {
  ChatMessageContent,
  ChatMessageStreamingComponent,
} from "@/components/chat/ChatMessageComponent";
import ChatTextBox from "@/components/chat/ChatTextBox";
import clsx from "clsx";
import { useApiGET, useApiPOST } from "@/api/fetcher";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import Completion, { CompletionMessage } from "@/state/Completion";
import {
  ApiChatGETResponse,
  ApiChatPOSTBody,
  ApiChatPOSTResponse,
} from "../../../pages/api/chats/[chat]";
import { getGlobalOpenAI, setGlobalOpenAI } from "@/state/OpenAI";
import ChatBotDetails from "../chatbot/ChatBotDetails";
import { useSession } from "next-auth/react";
import { trpc } from "@/util/trcp";

type ChatProps = {
  id: string;
};

export default function Chat(props: ChatProps) {
  const { data: session } = useSession();

  const trpcUtils = trpc.useUtils();
  const { data, isInitialLoading, error } = trpc.chats.get.useQuery({
    id: props.id,
  });
  const unauthenticated = !session?.user;
  const loading = isInitialLoading;
  const chat = data?.chat;

  const { post: postMessage, error: postError } = useApiPOST<
    ApiChatPOSTBody,
    ApiChatPOSTResponse
  >(`/api/chats/${props.id}`);

  const [aiCompletion, setAiCompletion] = useState<Completion | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [openai, setOpenai] = useState<OpenAI | null>(null);

  useEffect(() => {
    if (unauthenticated) return;
    // get/set openai key from localstorage
    if (apiKey !== null) {
      localStorage.setItem("openai-key", apiKey);
      setGlobalOpenAI(
        new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true,
        }),
      );
      setOpenai(getGlobalOpenAI()!);
    } else {
      const key = localStorage.getItem("openai-key");
      if (key !== null) setApiKey(key);
    }
  }, [apiKey]);

  const [hasBeenNamed, setHasBeenNamed] = useState<boolean>(false);
  useEffect(() => {
    if (unauthenticated) return;
    if (hasBeenNamed) return;
    if (chat?.messages.length === 2) {
      const summaryContent = chat.messages
        .map(
          (msg) =>
            `${
              msg.author === "USER"
                ? "User"
                : chat.chatbot.name + " (assistant)"
            }: ${JSON.parse(msg.content)
              .map((cont: ChatMessageContent) =>
                cont.type === "md" ? cont.content : "",
              )
              .join("")}`,
        )
        .join("\n\n");
      const namer = new Completion(
        openai!,
        "gpt-4",
        0.5,
        0,
        0,
        "When the user sends a message containing a chat transcript you have to provide a short name for the chat. This name must be at most one sentence and at least 2 words long. The name has to capture the essence of the given chat. Your response MUST only contain the name of the chat, without quotes or other formatting. Be specific and concrete about what's happening in the chat, don't try to give it a fancy or clever name.",
        [
          {
            role: "user",
            content: [
              {
                type: "md",
                content: summaryContent,
              },
            ],
          },
        ],
      );

      namer.run(
        () => {},
        (msg) => {
          const content = msg.content.reduce<string>((acc, cont) => {
            return cont.type === "md" ? acc + cont.content : acc;
          }, "");
          postMessage({
            type: "name",
            name: content,
          });
        },
      );
      setHasBeenNamed(true);
    }
  }, [chat]);

  async function onUserSend(cont: string) {
    if (unauthenticated) return;
    const message: CompletionMessage = {
      role: "user",
      content: [
        {
          type: "md",
          content: cont,
        },
      ],
    };

    trpcUtils.chats.get.setData({ id: props.id }, (oldData) => {
      return {
        chat: {
          ...oldData!.chat,
          messages: [
            ...oldData!.chat.messages,
            {
              id: "",
              author: "USER" as const,
              createdAt: new Date(),
              content: JSON.stringify(message.content),
            },
          ],
        },
      };
    });
    await postMessage({
      type: "message",
      author: "USER",
      content: JSON.stringify(message.content),
    });

    if (openai === null) return;
    if (chat === undefined) return;

    const comp = new Completion(
      openai,
      chat.chatbot.model,
      chat.chatbot.temperature,
      chat.chatbot.frequency_bias,
      chat.chatbot.presence_bias,
      chat.chatbot.systemMessage,
      [
        ...chat.messages.map((message) => {
          return {
            role:
              message.author === "USER"
                ? ("user" as const)
                : ("assistant" as const),
            content: JSON.parse(message.content) as ChatMessageContent[],
          };
        }),
        message,
      ],
      chat.chatbot.plugins,
    );
    setAiCompletion(comp);
  }

  const scrollDownRef = useRef<HTMLDivElement>(null);
  scrollDownRef.current?.scrollIntoView({
    behavior: "smooth",
  });

  // TODO better loading and null handling
  //if (loading) return <div>Loading...</div>;
  if (error !== null)
    return (
      <div>
        <h1 className="text-2xl">Error</h1>
        <div>{error.message}</div>
      </div>
    );

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0">
      {!unauthenticated && apiKey === null ? (
        <div className="z-20 flex h-full flex-col items-center justify-center backdrop-blur-lg">
          <div className="text-2xl">
            Please enter your OpenAI API key to access chat:
          </div>
          <br />
          <div className="flex gap-4">
            <input
              className="w-96 rounded bg-slate-300 p-2"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            <button
              className="rounded bg-slate-400 p-2"
              onClick={() => setApiKey(apiKeyInput)}
            >
              Set
            </button>
          </div>
          <div className="flex flex-col items-center">
            <br />
            <br />
            <p>
              We use your OpenAI API key to generate responses to your messages.
            </p>
            <p>
              The key is stored in your browser{"'"}s local storage. It is never
              sent to our server.
            </p>
            <br />
            <p>
              You can find your API key{" "}
              <a
                href="https://beta.openai.com/account/api-keys"
                className="text-blue-500 visited:text-purple-600 hover:underline"
              >
                here
              </a>
              .
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 top-0">
          <div className="flex h-full w-full flex-row items-stretch justify-stretch">
            {chat && (
              <div className="w-[17rem] flex-shrink-0">
                <div className="flex justify-center p-1 pt-12">
                  <h2 className="text-2xl">This chat</h2>
                </div>
                <ChatBotDetails id={chat.chatbot.id} />
                {unauthenticated && (
                  <div className="flex w-full justify-center p-2">
                    Shared by {chat.author.name}
                  </div>
                )}
              </div>
            )}
            <div className="relative flex-grow">
              <div className="no-scrollbar flex h-full flex-grow flex-col items-center overflow-auto scroll-smooth">
                <div className="flex w-full flex-col items-stretch justify-start px-4 pb-20 pt-8">
                  <div
                    className={clsx(
                      "mt-8 rounded-xl",
                      (chat?.messages ?? []).length === 0
                        ? "translate-y-0 opacity-100"
                        : "h-0 translate-y-[-2rem] opacity-0",
                      "transition-all duration-1000 ease-in-out",
                      "flex flex-col items-center justify-center",
                    )}
                  >
                    <h2 className="text-2xl">
                      What will you ask {chat?.chatbot.name}?
                    </h2>
                  </div>
                  {(chat?.messages ?? []).map((message, index) => {
                    return (
                      <div key={index}>
                        {index > 0 && <div className="h-2" />}
                        <ChatMessageComponent
                          content={
                            JSON.parse(message.content) as ChatMessageContent[]
                          }
                          author={
                            message.author === "USER"
                              ? "You"
                              : chat?.chatbot.name ?? "assistant"
                          }
                          streaming={false}
                        />
                      </div>
                    );
                  })}
                  {aiCompletion !== null && (
                    <div key={chat?.messages.length}>
                      <ChatMessageStreamingComponent
                        author={chat?.chatbot.name ?? ""}
                        completion={aiCompletion}
                        onComplete={(message) => {
                          setAiCompletion(null);
                          const json = JSON.stringify(message);
                          trpcUtils.chats.get.setData(
                            { id: props.id },
                            (oldData) => {
                              return {
                                chat: {
                                  ...oldData!.chat,
                                  messages: [
                                    ...oldData!.chat.messages,
                                    {
                                      id: "",
                                      author: "CHATBOT" as const,
                                      content: json,
                                      createdAt: new Date(),
                                    },
                                  ],
                                },
                              };
                            },
                          );
                          postMessage({
                            type: "message",
                            author: "CHATBOT" as const,
                            content: json,
                          });
                        }}
                      />
                    </div>
                  )}
                </div>

                <div ref={scrollDownRef} className="snap-end"></div>
              </div>
              {!unauthenticated && (
                <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center">
                  {false && (
                    <>
                      <div>Waiting for response...</div>
                      <div className="h-2" />
                    </>
                  )}
                  <ChatTextBox onSend={onUserSend} canSend={true} />
                  <div className="h-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
