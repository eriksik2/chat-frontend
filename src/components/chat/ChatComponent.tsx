"use client"

import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import ChatTextBox from './ChatTextBox';
import ChatMessageComponent from './ChatMessageComponent';
import ChatMessage from '@/state/ChatMessage';
import Toolbar from '../toolbar/Toolbar';
import { useReactive } from '@/util/Reactive';
import ChatSession from '../../state/ChatSession';
import ToolbarDrawer from '../toolbar/ToolbarDrawer';
import ChatBot from '@/state/ChatBot';


type ChatComponentProps = {
    apiKey: string;
};

export default function ChatComponent(props: ChatComponentProps) {
    const [openai, setOpenai] = useState(new OpenAI({
        apiKey: props.apiKey,
        dangerouslyAllowBrowser: true,
    }));

    const [chatState] = useState(new ChatSession(openai, new ChatBot()));
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
        chat.addMessage(ChatMessage.fromUser(chat, newMessage));
        chat.addMessage(ChatMessage.fromAI(chat, chat.chatbot, chat.history.map((message) => message.toChatMessage())));
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
                    <ChatMessageComponent
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