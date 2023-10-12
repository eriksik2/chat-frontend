"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/lib/Reactive';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatBotEdit from './ChatBotEdit';
import React from 'react';

type ChatBotAddProps = {
    app: App;
    onDiscard: () => void;
    onSave: (chatbot: ChatBot) => void;
};

export default function ChatBotAdd(props: ChatBotAddProps) {
    const [chatbot, setChatbot] = React.useState(new ChatBot(props.app));
    const _ = useReactive(chatbot);

    return <div className='bg-slate-300 rounded p-2'>
        <ChatBotEdit
            chatbot={chatbot}
            onClose={() => props.onDiscard()}
        />
        <div className='flex flex-row justify-end gap-2'>
            <button
                className='bg-slate-400 rounded p-2'
                onClick={() => props.onSave(chatbot)}
            >Save</button>
            <button
                className='bg-slate-400 rounded p-2'
                onClick={() => props.onDiscard()}
            >Cancel</button>
        </div>
    </div>;
}