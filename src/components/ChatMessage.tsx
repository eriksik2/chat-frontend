"use client"

import ChatMessageState from '@/components/ChatMessageState';
import { useReactive } from '@/util/Reactive';
import { useState } from 'react';

type ChatMessageProps = {
    message: ChatMessageState;
};

export default function ChatMessage(props: ChatMessageProps) {
    const message = useReactive(props.message);

    function handleChange() {
        message.setSelected(!message.selected);
    }

    return <div
        className='flex flex-row gap-2 group/msg min-h-[4rem] rounded-xl overflow-hidden border-2 border-transparent hover:border-gray-400'
        style={{
            borderColor: message.selected ? 'blue' : undefined,
        }}
        onClick={handleChange}
    >
        <div className='px-4 py-2 flex flex-col items-start text-white bg-gray-500'>
            <p>{message.message.role}</p>
            <div className='flex-grow' />
            <input
                className="hidden checked:block group-hover/msg:block"
                type="checkbox"
                checked={message.selected}
                onChange={handleChange}
            />
        </div>
        <div>{message.message.content}</div>
    </div>
}