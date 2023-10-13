import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import ChatMessageComponent from "@/components/chat/ChatMessageComponent";
import ChatTextBox from "@/components/chat/ChatTextBox";
import clsx from "clsx";
import useSWR from 'swr';
import { ApiChatGETResponse, ApiChatPOSTBody } from "../../../pages/api/chats/[chat]";

type ChatPageProps = {
    id: string;
};

export default function ChatPage(props: ChatPageProps) {

    const data = useSWR<ApiChatGETResponse>(`/api/chats/${props.id}`, (url: string) => fetch(url).then(res => res.json()));
    const chat = data.data;
    const loading = data.isLoading;

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
        const newChat = chat === null ? null : {
            ...chat!, messages: [...chat!.messages, {
                author: "USER" as "USER",
                content: message,
                createdAt: new Date(),
            }]
        };
        if (newChat !== null) data.mutate(newChat, false);
        await fetch(`/api/chat/${props.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
            } satisfies ApiChatPOSTBody),
        });
        if (newChat !== null) data.mutate(newChat, true);
    }

    const scrollDownRef = useRef<HTMLDivElement>(null);
    scrollDownRef.current?.scrollIntoView({
        behavior: 'smooth',
    });

    // TODO better loading and null handling
    if (loading) return <div>Loading...</div>;
    if (chat === null) return <div>Chat not found.</div>;

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
                    <div className='px-4 pt-14 pb-16 flex flex-col items-center justify-start'>
                        <div className={clsx(
                            'mt-8 w-1/3 rounded-xl',
                            chat!.messages.length === 0
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-[-2rem] h-0',
                            "transition-all duration-1000 ease-in-out",
                            "flex flex-col items-center justify-center"
                        )}>
                            <h2 className='text-2xl'>
                                What will you ask {"chatbot.name"}?
                            </h2>
                        </div>
                        {chat!.messages.map((message, index) => {

                            return <div key={index} className='w-full'>
                                {index > 0 && <div className='h-2' />}
                                <ChatMessageComponent
                                    content={message.content}
                                    author={message.author}
                                    typing={false}
                                />
                            </div>;
                        })}
                    </div>

                    <div ref={scrollDownRef} className='snap-end'></div>
                </div>

                <div className='flex flex-col items-center absolute left-0 right-0 bottom-0 z-10'>
                    {true && <>
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