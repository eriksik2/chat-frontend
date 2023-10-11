"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { useEffect, useMemo, useState } from 'react';
import ChatBotCard from './ChatBotCard';
import Modal from '../Modal';
import ChatBotAdd from './ChatBotAdd';

import { FaAngleDown, FaCirclePlus } from 'react-icons/fa6';
import ChatBotListCategory from './ChatBotListCategory';

type ChatBotListProps = {
    app: App;
};

export default function ChatBotList(props: ChatBotListProps) {
    const state = useReactive(props.app);

    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        state.chatbots.forEach((chatbot) => {
            chatbot.tags.forEach((tag) => {
                categories.add(tag);
            });
        });
        return Array.from(categories);
    }, [state]);

    const [showAdd, setShowAdd] = useState(false);

    function onSave(chatbot: ChatBot) {
        state.addChatbot(chatbot);
        setShowAdd(false);
    }
    return <div className='flex flex-col gap-4 items-stretch justify-start h-full w-full p-4'>
        <h1 className='text-4xl'>Chatbots</h1>
        <p className='w-1/3'>
            List of chatbots tagged by categories. You can select a pre-existing bot or add, edit, and remove chatbots as needed.
        </p>
        {([...allCategories, null]).map((category) => {
            return <ChatBotListCategory
                key={category}
                app={state}
                category={category}
            />;
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