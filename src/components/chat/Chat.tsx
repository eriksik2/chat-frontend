import { useState, useEffect, useRef } from "react";
import ChatMessageComponent from "@/components/chat/ChatMessageComponent";
import ChatTextBox from "@/components/chat/ChatTextBox";
import clsx from "clsx";
import { ApiChatGETResponse, ApiChatPOSTBody, ApiChatPOSTResponse } from "../../../pages/api/chats/[chat]";
import { useApiGET, useApiPOST } from "@/api/fetcher";

type ChatPageProps = {
    id: string;
};

export default function ChatPage(props: ChatPageProps) {

    const { data, error, reloading, mutate } = useApiGET<ApiChatGETResponse>(`/api/chats/${props.id}`, {
        refreshInterval: 150,
    });
    const loading = data === null && reloading;
    const chat = data;

    const { post: postMessage, error: postError } = useApiPOST<ApiChatPOSTBody, ApiChatPOSTResponse>(`/api/chats/${props.id}`);

    const [optimisticLatestMessage, setOptimisticLatestMessage] = useState<string | null>(null);
    useEffect(() => {
        setOptimisticLatestMessage(null);
    }, [data]);

    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [apiKey, setApiKey] = useState<string | null>(null);

    useEffect(() => {
        // get/set openai key from localstorage
        if (apiKey !== null) localStorage.setItem('openai-key', apiKey);
        else {
            const key = localStorage.getItem('openai-key');
            if (key !== null) setApiKey(key);
        }
    }, [apiKey]);

    async function onUserSend(message: string) {
        setOptimisticLatestMessage(message);
        await postMessage({
            content: message,
        });
    }

    const scrollDownRef = useRef<HTMLDivElement>(null);
    scrollDownRef.current?.scrollIntoView({
        behavior: 'smooth',
    });

    // TODO better loading and null handling
    if (loading) return <div>Loading...</div>;
    if (error !== null) return <div>
        <h1 className="text-2xl">Error</h1>
        <div>{error.status}</div>
        <div>{error.message}</div>
    </div>;

    return <div className='absolute top-0 bottom-0 right-0 left-0'>
        {apiKey === null ?
            <div className='backdrop-blur-lg flex flex-col items-center justify-center z-20'>
                <div className='text-2xl'>Please enter your OpenAI API key to access chat.</div>
                <div className='h-2' />
                <div className='flex gap-4'>
                    <input
                        className='bg-slate-300 rounded p-2'
                        value={apiKeyInput}
                        onChange={e => setApiKeyInput(e.target.value)}
                    />
                    <button
                        className='bg-slate-400 rounded p-2'
                        onClick={() => setApiKey(apiKeyInput)}
                    >Set</button>
                </div>
            </div>
            :
            <div className='absolute top-0 bottom-0 right-0 left-0'>
                <div className='overflow-auto scroll-smooth snap-y snap-proximity h-full'>
                    <div className='px-4 pt-8 pb-20 flex flex-col items-center justify-start'>
                        <div className={clsx(
                            'mt-8 w-1/3 rounded-xl',
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
                            return <div key={index} className='w-full'>
                                {index > 0 && <div className='h-2' />}
                                <ChatMessageComponent
                                    id={message.id}
                                    content={message.content}
                                    author={message.author}
                                    streaming={message.streaming}
                                />
                            </div>;
                        })}
                        {optimisticLatestMessage !== null && <div key={chat?.messages.length ?? 0} className='w-full'>
                            <ChatMessageComponent
                                id={null}
                                content={optimisticLatestMessage}
                                author={"USER"}
                                streaming={false}
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