import { FaPen, FaTrash } from 'react-icons/fa6';
import clsx from 'clsx';
import { ApibotsResponseData } from '../../../pages/api/bots';
import { useApiPOST } from '@/api/fetcher';
import { ApiChatsPOSTBody, ApiChatsPOSTResponse } from '../../../pages/api/chats';
import { useRouter } from 'next/router';

type ChatBotCardProps = {
    chatbot: ApibotsResponseData[0];
};

export default function ChatBotCard(props: ChatBotCardProps) {
    const router = useRouter();
    const { post, error } = useApiPOST<ApiChatsPOSTBody, ApiChatsPOSTResponse>(`/api/chats`);

    return <div className='bg-zinc-400 rounded p-2 shadow-md flex flex-col justify-between'>
        <div className='px-2 pt-1'>
            <div className='flex flex-row items-baseline gap-2'>
                <p className='text-xl'>{props.chatbot.name}</p>
                <p className='text-sm'>by {props.chatbot.author.name}</p>
            </div>
            <br />
            <p className='max-w-xs'>{props.chatbot.description}</p>
            <br />
        </div>
        <div className='flex flex-row justify-end gap-2 pt-2'>
            <button
                className='bg-green-100 rounded p-1 text-sm'
                onClick={async () => {
                    const response = await post({
                        chatbotId: props.chatbot.id,
                    });
                    if (response.chatId !== null) {
                        router.push(`/chats/${response.chatId}`);
                    }
                }}
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