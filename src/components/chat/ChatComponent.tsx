"use client"

import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import ChatTextBox from './ChatTextBox';
import ChatMessageComponent from './ChatMessageComponent';
import ChatMessage, { NoApiKeyError } from '@/state/ChatMessage';
import Toolbar from '../toolbar/Toolbar';
import { useReactive } from '@/util/Reactive';
import ChatSession from '../../state/ChatSession';
import ToolbarDrawer from '../toolbar/ToolbarDrawer';
import ChatBot from '@/state/ChatBot';
import App from '@/state/App';


type ChatComponentProps = {
    chat: ChatSession;
};

export default function ChatComponent(props: ChatComponentProps) {
    const chat = useReactive(props.chat);
    const chatbot = useReactive(chat.chatbot);
    const app = useReactive(chat.app);

    const needApiKey = app.openai === null && chatbot.model !== "mock";
    const [apiKeyInput, setApiKeyInput] = useState('');

    function onUserSend(message: string) {
        if (message.trim() === '') return;
        promptAI(message);
    }

    async function promptAI(newMessage: string) {
        chat.addMessage(ChatMessage.fromUser(chat, newMessage));
        chat.addMessage(ChatMessage.fromAI(chat, chatbot, chat.history.map((message) => message.toChatMessage())));
    }

    return <div className='h-full relative'>
        {needApiKey &&
            <div className='absolute top-0 left-0 right-0 bottom-0 backdrop-blur-lg flex flex-col items-center justify-center z-20'>
                <div className='text-2xl'>Please enter your OpenAI API key</div>
                <div className='h-2' />
                <div className='flex gap-4'>
                    <input
                        className='bg-slate-300 rounded p-2'
                        value={apiKeyInput}
                        onChange={e => setApiKeyInput(e.target.value)}
                    />
                    <button
                        className='bg-slate-400 rounded p-2'
                        onClick={() => app.setOpenAI(apiKeyInput)}
                    >Set</button>
                </div>
            </div>
        }
        <div className='px-6 absolute left-0 right-0 top-0 z-10'>
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
        </div>

        <div className='absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col gap-2 px-4 pt-14 pb-16'>
            {chat.history.map((message, index) => {
                if (message.role === 'system') return null;
                return <ChatMessageComponent
                    key={index}
                    message={message}
                />;
            })}
        </div>

        <div className='flex flex-col items-center absolute left-0 right-0 bottom-0 z-10'>
            {chat.loading && <>
                <div>Waiting for response...</div>
                <div className='h-2' />
            </>}
            <ChatTextBox
                onSend={onUserSend}
                canSend={!chat.loading}
            />
            <div className='h-4' />
        </div>
    </div>
}