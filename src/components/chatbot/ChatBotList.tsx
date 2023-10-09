"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { useEffect, useState } from 'react';
import ChatBotCard from './ChatBotCard';

type ChatBotListProps = {
    app: App;
};

export default function ChatBotList(props: ChatBotListProps) {
    const state = useReactive(props.app);

    function onAdd() {
        state.addChatbot(new ChatBot());
    }
    return <div className='flex flex-row gap-4 items-center justify-center h-full w-1/2'>
        {state.chatbots.map((chatbot, i) => {
            return <ChatBotCard key={i} chatbot={chatbot} />;
        })}
        <button
            onClick={onAdd}
        >Add</button>
    </div>
}