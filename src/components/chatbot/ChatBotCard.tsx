"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatBotEdit from './ChatBotEdit';

type ChatBotCardProps = {
    chatbot: ChatBot;
};

export default function ChatBotCard(props: ChatBotCardProps) {
    const chatbot = useReactive(props.chatbot);

    const [showEdit, setShowEdit] = useState(false);

    return <div className='bg-zinc-400 rounded p-2'>
        {showEdit &&
            <ChatBotEdit
                chatbot={chatbot}
                onClose={() => setShowEdit(false)}
            />
        }
        <p>{chatbot.name}</p>
        <p>{chatbot.description}</p>
        <div className='flex flex-row'>
            <button
                onClick={() => setShowEdit(true)}
            >Edit</button>
        </div>
    </div>;
}