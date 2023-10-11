"use client"

import ChatMessage from '@/state/ChatMessage';
import { useReactive } from '@/util/Reactive';
import clsx from 'clsx';

import Markdown from 'react-markdown';
import ChatMarkdown from './ChatMarkdown';

type ChatMessageComponentProps = {
    message: ChatMessage;
};

export default function ChatMessageComponent(props: ChatMessageComponentProps) {
    const message = useReactive(props.message);

    function handleChange() {
        message.setSelected(!message.selected);
    }

    return <div
        className={clsx(
            'overflow-hidden',
            'flex flex-row flex-grow group/msg min-h-[4rem] rounded-xl border-2',
            message.selected
                ? 'border-blue-500 hover:border-blue-800'
                : 'border-transparent hover:border-gray-400'
        )}
        onClick={handleChange}
    >
        <div className='px-4 py-2 flex flex-col flex-none items-start text-white bg-gray-500'>
            <p>{message.producer?.name ?? message.role}</p>
            <div className='flex-grow' />
            <input
                className="hidden checked:block group-hover/msg:block"
                type="checkbox"
                checked={message.selected}
                onChange={handleChange}
            />
        </div>
        <div className='p-4 pb-2'>
            <ChatMarkdown
                content={message.content}
                loading={message.loading}
            />
        </div>
    </div>
}