"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { useEffect, useState } from 'react';
import ChatBotCard from './ChatBotCard';
import Modal from '../Modal';
import ChatBotAdd from './ChatBotAdd';

import { FaCirclePlus } from 'react-icons/fa6';

type ChatBotListProps = {
    app: App;
};

export default function ChatBotList(props: ChatBotListProps) {
    const state = useReactive(props.app);

    const [showAdd, setShowAdd] = useState(false);

    function onSave(chatbot: ChatBot) {
        state.addChatbot(chatbot);
        setShowAdd(false);
    }
    return <div className='flex flex-row flex-wrap gap-4 items-center content-start justify-start h-full w-full p-4'>
        {state.chatbots.map((chatbot, i) => {
            return <ChatBotCard key={i} chatbot={chatbot} />;
        })}
        <button
            className="text-xl"
            onClick={() => setShowAdd(true)}
        ><FaCirclePlus /></button>
        {showAdd &&
            <Modal onClose={() => setShowAdd(false)}>
                <ChatBotAdd
                    app={state}
                    onDiscard={() => setShowAdd(false)}
                    onSave={onSave}
                />
            </Modal>
        }
    </div>
}