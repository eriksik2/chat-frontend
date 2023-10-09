"use client"

import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import ChatTextBox from './ChatTextBox';
import ChatMessage from './ChatMessage';
import ChatMessageState from '@/components/ChatMessageState';
import Toolbar from './Toolbar';
import { useReactive } from '@/util/Reactive';
import ChatState from './ChatState';
import ToolbarDrawer from './ToolbarDrawer';


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

    useEffect(() => {
        setOpenai(new OpenAI({
            apiKey: props.apiKey,
            dangerouslyAllowBrowser: true,
        }));
    }, [props.apiKey]);

    useEffect(() => {
        chatState.setOpenAI(openai);
    }, [openai]);

    function onUserSend(message: string) {
        if (message.trim() === '') return;
        promptAI(message);
    }

    async function promptAI(newMessage: string) {
        chat.addMessage(ChatMessageState.fromUser(newMessage));
        chat.addMessage(ChatMessageState.fromAI(openai, {
            //model: "gpt-4",
            model: "gpt-3.5-turbo",
            messages: chat.history.map((message) => message.toChatMessage()),
        }));
    }

    return <div className='flex flex-col items-center max-h-fit justify-center p-2'>
        <ToolbarDrawer>
            <Toolbar
                targets={[chat]}
            />
            <Toolbar
                targets={chat.history}
                filter={(msg) => msg.selected}
                filterDisplay={(count) => count > 0 ? `${count} selected` : null}
            />
        </ToolbarDrawer>
        <div className='h-2' />
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
        <div className='h-2' />

        {chat.loading && <>
            <div>Waiting for response...</div>
            <div className='h-2' />
        </>}
        <ChatTextBox
            onSend={onUserSend}
            canSend={!chat.loading}
        />
    </div>
}