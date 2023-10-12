"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/lib/Reactive';
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
        console.log(state.chatbots);
        setShowAdd(false);
    }
    return <div className='h-full relative'>
        <div className='flex flex-col items-stretch justify-start absolute top-0 left-0 right-0 bottom-0'>
            <div className='w-full shadow-xl z-30'>
                <div className='w-2/5 p-4 py-6'>
                    <h1 className='text-5xl pb-2'>Chatbots</h1>
                    <p>
                        List of chatbots tagged by categories. You can select a pre-existing bot or add, edit, and remove chatbots as needed.

                    </p>
                    <br />
                    <p>
                        Select a chatbot and press the New Chat button, then you can chat with it in the Chats tab.
                    </p>
                </div>
            </div>
            <div className='overflow-auto no-scrollbar flex flex-col gap-2 px-4 pt-4'>
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
        </div>
    </div>
}