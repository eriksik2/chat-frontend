"use client"

import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import ChatTextBox from './ChatTextBox';
import ChatMessage from './ChatMessage';
import ChatMessageState from '@/components/ChatMessageState';
import Toolbar from './Toolbar';
import { useReactive } from '@/util/Reactive';
import ChatState from './ChatState';


type ChatProps = {
    apiKey: string;
};

export default function Chat(props: ChatProps) {
    const [openai, setOpenai] = useState(new OpenAI({
        apiKey: props.apiKey,
        dangerouslyAllowBrowser: true,
    }));

    const [chatState] = useState(new ChatState());
    const chat = useReactive(chatState);
    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
        setOpenai(new OpenAI({
            apiKey: props.apiKey,
            dangerouslyAllowBrowser: true,
        }));
    }, [props.apiKey]);

    function onUserSend(message: string) {
        if (message.trim() === '') return;
        const chatMessage: OpenAI.Chat.ChatCompletionMessage = {
            role: 'user',
            content: message,
        };

        promptAI(chatMessage);
    }

    async function promptAI(newMessage: OpenAI.Chat.ChatCompletionMessage) {
        setWaiting(true);
        chat.addMessage(new ChatMessageState(chat, newMessage));
        //const completion = await openai.chat.completions.create({
        //    //model: "gpt-4",
        //    model: "gpt-3.5-turbo",
        //    messages: newHistory.map((message) => message.message),
        //    n: 1,
        //});
        //const chatMessage: OpenAI.Chat.ChatCompletionMessage = completion.choices[0].message;
        const chatMessage: OpenAI.Chat.ChatCompletionMessage = {
            role: 'assistant',
            content: 'Hello, world!',
        };
        if (chatMessage.content === null) {
            setWaiting(false);
            return;
        }

        chat.addMessage(new ChatMessageState(chat, chatMessage));
        setWaiting(false);
    }

    return <div className='flex flex-col items-center max-h-fit justify-center p-2'>
        <Toolbar
            targets={chat.history.filter((msg) => msg.selected)}
        />
        <div className='flex flex-col items-stretch justify-start gap-2 w-full overflow-auto'>
            {chat.history.map((message, index) => {
                if (message.message.role === 'system') return null;
                return <>
                    <ChatMessage
                        key={index}
                        message={message}
                    />
                    {false && index !== history.length - 1 &&
                        <div className='flex flex-col items-center'>
                            <div
                                key={index + 'divider'}
                                className='bg-slate-500 w-2/3 h-px'
                            />
                        </div>
                    }
                </>;
            })}
        </div>

        {waiting && <div>Waiting for response...</div>}
        <ChatTextBox
            onSend={onUserSend}
            canSend={!waiting}
        />
    </div>
}