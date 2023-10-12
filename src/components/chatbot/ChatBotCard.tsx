import { FaPen, FaTrash } from 'react-icons/fa6';
import clsx from 'clsx';
import { ApibotsResponseData } from '../../../pages/api/bots';

type ChatBotCardProps = {
    chatbot: ApibotsResponseData[0];
};

export default function ChatBotCard(props: ChatBotCardProps) {
    return <div className={clsx('bg-zinc-400 rounded p-2 shadow-md border-2')}>
        <p>{props.chatbot.name}</p>
        <p>{props.chatbot.description}</p>
        <div className='flex flex-row justify-end gap-2 pt-2'>
            <button
                className='bg-green-100 rounded p-1 text-sm'
            >
                New Chat
            </button>
            <div className='flex-grow' />
            <button
                className='bg-slate-500 rounded p-1'
            >
                <FaPen />
            </button>
            <button
                className='bg-red-400 rounded p-1'
            >
                <FaTrash />
            </button>
        </div>
    </div>;
}