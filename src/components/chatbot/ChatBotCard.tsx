"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatBotEdit from './ChatBotEdit';
import Modal from '../Modal';

import { FaPen, FaTrash } from 'react-icons/fa6';
import clsx from 'clsx';
import { Chat } from 'openai/resources/index.mjs';
import ChatSession from '@/state/ChatSession';

type ChatBotCardProps = {
    chatbot: ChatBot;
};

export default function ChatBotCard(props: ChatBotCardProps) {
    const chatbot = useReactive(props.chatbot);
    const _ = useReactive(chatbot.app);

    const [showEdit, setShowEdit] = useState(false);

    function onNewChat() {
        chatbot.app.addChat(new ChatSession(chatbot.app, chatbot));
        alert("New chat has been created. Go to Chats tab");
    }

    return <div
        className={clsx(
            'bg-zinc-400 rounded p-2 shadow-md border-2',
            chatbot.isSelectedDefault()
                ? 'border-blue-500'
                : 'border-transparent',
        )}
        onClick={() => chatbot.app.setDefaultChatbot(chatbot)}
    >
        {showEdit &&
            <Modal onClose={() => setShowEdit(false)}>
                <ChatBotEdit
                    chatbot={chatbot}
                    onClose={() => setShowEdit(false)}
                />
            </Modal>
        }
        <p>{chatbot.name}</p>
        <p>{chatbot.description}</p>
        <div className='flex flex-row justify-end gap-2 pt-2'>
            <button
                className='bg-green-100 rounded p-1 text-sm'
                onClick={onNewChat}
            >
                New Chat
            </button>
            <div className='flex-grow' />
            <button
                className='bg-slate-500 rounded p-1'
                onClick={() => setShowEdit(true)}
            >
                <FaPen />
            </button>
            <button
                className='bg-red-400 rounded p-1'
                onClick={() => chatbot.app.removeChatbot(chatbot)}
            >
                <FaTrash />
            </button>
        </div>
    </div>;
}