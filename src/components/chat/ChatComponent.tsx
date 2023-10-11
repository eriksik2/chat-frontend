"use client"

import OpenAI from 'openai';
import { useEffect, useRef, useState } from 'react';
import ChatTextBox from './ChatTextBox';
import ChatMessageComponent from './ChatMessageComponent';
import ChatMessage, { NoApiKeyError } from '@/state/ChatMessage';
import Toolbar from '../toolbar/Toolbar';
import { useReactive } from '@/util/Reactive';
import ChatSession from '../../state/ChatSession';
import ToolbarDrawer from '../toolbar/ToolbarDrawer';
import clsx from 'clsx';


type ChatComponentProps = {
    chat: ChatSession;
};

export default function ChatComponent(props: ChatComponentProps) {
    const chat = useReactive(props.chat);
    const chatbot = useReactive(chat.chatbot);
    const app = useReactive(chat.app);

    const needApiKey = app.openai === null && chatbot.model !== "mock";
    const [apiKeyInput, setApiKeyInput] = useState('');

    const scrollDownRef = useRef<HTMLDivElement>(null);
    scrollDownRef.current?.scrollIntoView({
        behavior: 'smooth',
    });

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

        <div className='absolute top-0 left-0 right-0 bottom-0 overflow-auto scroll-smooth snap-y snap-proximity'>
            <div className='px-4 pt-14 pb-16 flex flex-col items-center justify-start'>
                <div className={clsx(
                    'mt-8 w-1/3 rounded-xl',
                    chat.history.length === 0
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-[-2rem] h-0',
                    "transition-all duration-1000 ease-in-out",
                    "flex flex-col items-center justify-center"
                )}>
                    <h2 className='text-2xl'>
                        What will you ask {chatbot.name}?
                    </h2>
                </div>
                {chat.history.map((message, index) => {
                    if (message.role === 'system') return null;

                    return <div key={index} className='w-full'>
                        {index > 0 && <div className='h-2' />}
                        <ChatMessageComponent
                            message={message}
                        />
                    </div>;
                })}
            </div>

            <div ref={scrollDownRef} className='snap-end'></div>
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