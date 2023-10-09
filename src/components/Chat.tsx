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
        promptAI(message);
    }

    async function promptAI(newMessage: string) {
        setWaiting(true);
        chat.addMessage(ChatMessageState.fromUser(newMessage));
        //const completion = await openai.chat.completions.create({
        //    //model: "gpt-4",
        //    model: "gpt-3.5-turbo",
        //    messages: newHistory.map((message) => message.message),
        //    n: 1,
        //});
        //const chatMessage: OpenAI.Chat.ChatCompletionMessage = completion.choices[0].message;
        const aiMessage: OpenAI.Chat.ChatCompletionMessage = {
            role: 'assistant',
            content: 'Hello, world!',
        };
        if (aiMessage.content === null) {
            setWaiting(false);
            return;
        }

        chat.addMessage(await ChatMessageState.fromAIMock(openai, {
            //model: "gpt-4",
            model: "gpt-3.5-turbo",
            messages: chat.history.map((message) => message.toChatMessage()),
        }));
        setWaiting(false);
    }

    return <div className='flex flex-col items-center max-h-fit justify-center p-2'>
        <Toolbar
            targets={chat.history.filter((msg) => msg.selected)}
        />
        <div className='flex flex-col items-stretch justify-start gap-2 w-full overflow-auto'>
            {chat.history.map((message, index) => {
                if (message.role === 'system') return null;
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