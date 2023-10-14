import { useState, useEffect, useRef } from "react";
import ChatMessageComponent, { ChatMessageContent, ChatMessageStreamingComponent } from "@/components/chat/ChatMessageComponent";
import ChatTextBox from "@/components/chat/ChatTextBox";
import clsx from "clsx";
import { useApiGET, useApiPOST } from "@/api/fetcher";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import Completion, { CompletionMessage } from "@/state/Completion";
import { ApiChatGETResponse, ApiChatPOSTBody, ApiChatPOSTResponse } from "../../../pages/api/chats/[chat]";
import { getGlobalOpenAI, setGlobalOpenAI } from "@/state/OpenAI";

type ChatProps = {
    id: string;
};

export default function Chat(props: ChatProps) {

    const { data, error, reloading, mutate } = useApiGET<ApiChatGETResponse>(`/api/chats/${props.id}`);
    const loading = data === undefined && reloading;
    const chat = data;
    console.log(chat)

    const { post: postMessage, error: postError } = useApiPOST<ApiChatPOSTBody, ApiChatPOSTResponse>(`/api/chats/${props.id}`);

    const [aiCompletion, setAiCompletion] = useState<Completion | null>(null);

    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [openai, setOpenai] = useState<OpenAI | null>(null);

    useEffect(() => {
        // get/set openai key from localstorage
        if (apiKey !== null) {
            localStorage.setItem('openai-key', apiKey);
            setGlobalOpenAI(new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true,
            }));
            setOpenai(getGlobalOpenAI()!);
        }
        else {
            const key = localStorage.getItem('openai-key');
            if (key !== null) setApiKey(key);
        }
    }, [apiKey]);

    async function onUserSend(cont: string) {
        const message: CompletionMessage = {
            role: "user",
            content: [
                {
                    type: "md",
                    content: cont,
                },
            ],
        };

        const newChat = chat === undefined ? null : {
            messages: [...chat.messages, {
                id: "",
                author: "USER" as const,
                content: JSON.stringify(message.content),
            }],
            chatbot: chat.chatbot,
        };
        newChat && mutate(newChat, false);
        await postMessage({
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
            [...chat.messages.map(message => {
                return {
                    role: message.author === "USER" ? "user" as const : "assistant" as const,
                    content: JSON.parse(message.content) as ChatMessageContent[],
                };
            }), message],
        );
        setAiCompletion(comp);
    }

    const scrollDownRef = useRef<HTMLDivElement>(null);
    scrollDownRef.current?.scrollIntoView({
        behavior: 'smooth',
    });

    // TODO better loading and null handling
    //if (loading) return <div>Loading...</div>;
    if (error !== null) return <div>
        <h1 className="text-2xl">Error</h1>
        <div>{error.status}</div>
        <div>{error.message}</div>
    </div>;

    return <div className='absolute top-0 bottom-0 right-0 left-0'>
        {apiKey === null ?
            <div className='backdrop-blur-lg flex flex-col items-center justify-center z-20 h-full'>
                <div className='text-2xl'>Please enter your OpenAI API key to access chat:</div>
                <br />
                <div className='flex gap-4'>
                    <input
                        className='bg-slate-300 rounded p-2 w-96'
                        type='password'
                        value={apiKeyInput}
                        onChange={e => setApiKeyInput(e.target.value)}
                    />
                    <button
                        className='bg-slate-400 rounded p-2'
                        onClick={() => setApiKey(apiKeyInput)}
                    >Set</button>
                </div>
                <div className="flex flex-col items-center">
                    <br />
                    <br />
                    <p>
                        We use your OpenAI API key to generate responses to your messages.
                    </p>
                    <p>
                        The key is stored in your browser{"'"}s local storage. It is never sent to our server.
                    </p>
                    <br />
                    <p>
                        You can find your API key{" "}
                        <a
                            href="https://beta.openai.com/account/api-keys"
                            className="text-blue-500 hover:underline visited:text-purple-600"
                        >
                            here
                        </a>.
                    </p>
                </div>
            </div>
            :
            <div className='absolute top-0 bottom-0 right-0 left-0'>
                <div className='overflow-auto scroll-smooth no-scrollbar h-full flex flex-col items-center'>
                    <div className='px-4 pt-8 pb-20 flex flex-col items-stretch justify-start pr-32 w-5/6'>
                        <div className={clsx(
                            'mt-8 rounded-xl',
                            (chat?.messages ?? []).length === 0
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-[-2rem] h-0',
                            "transition-all duration-1000 ease-in-out",
                            "flex flex-col items-center justify-center"
                        )}>
                            <h2 className='text-2xl'>
                                What will you ask {chat?.chatbot.name}?
                            </h2>
                        </div>
                        {(chat?.messages ?? []).map((message, index) => {
                            return <div key={index}>
                                {index > 0 && <div className='h-2' />}
                                <ChatMessageComponent
                                    content={JSON.parse(message.content) as ChatMessageContent[]}
                                    author={message.author === "USER" ? "You" : chat?.chatbot.name ?? "assistant"}
                                    streaming={false}
                                />
                            </div>;
                        })}
                        {aiCompletion !== null && <div key={chat?.messages.length}>
                            <ChatMessageStreamingComponent
                                author={chat?.chatbot.name ?? ""}
                                completion={aiCompletion}
                                onComplete={(message) => {
                                    setAiCompletion(null);
                                    const json = JSON.stringify(message);
                                    const newChat = chat === undefined ? null : {
                                        messages: [...chat.messages, {
                                            id: "",
                                            author: "CHATBOT" as const,
                                            content: json,
                                        }],
                                        chatbot: chat.chatbot,
                                    };
                                    newChat && mutate(newChat, false);
                                    postMessage({
                                        author: "CHATBOT" as const,
                                        content: json,
                                    });
                                }}
                            />
                        </div>}
                    </div>

                    <div ref={scrollDownRef} className='snap-end'></div>
                </div>

                <div className='flex flex-col items-center absolute left-0 right-0 bottom-0 z-10'>
                    {false && <>
                        <div>Waiting for response...</div>
                        <div className='h-2' />
                    </>}
                    <ChatTextBox
                        onSend={onUserSend}
                        canSend={true}
                    />
                    <div className='h-4' />
                </div>
            </div>
        }
    </div>;
}