"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatBotEdit from './ChatBotEdit';
import Modal from '../Modal';

import { FaPen, FaTrash } from 'react-icons/fa6';

type ChatBotCardProps = {
    chatbot: ChatBot;
};

export default function ChatBotCard(props: ChatBotCardProps) {
    const chatbot = useReactive(props.chatbot);

    const [showEdit, setShowEdit] = useState(false);

    return <div className='bg-zinc-400 rounded p-2 shadow-md'>
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
        <div className='flex flex-row justify-end gap-2'>
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