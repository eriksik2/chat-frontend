import { FaPen, FaTrash } from 'react-icons/fa6';
import clsx from 'clsx';
import { ApibotsGETResponse } from '../../../pages/api/bots';
import { useApiPOST } from '@/api/fetcher';
import { ApiChatsPOSTBody, ApiChatsPOSTResponse } from '../../../pages/api/chats';
import { useRouter } from 'next/router';
import Modal from '../Modal';
import { ChatBotEdit } from './ChatBotEdit';
import { useState } from 'react';
import { useSWRConfig } from 'swr';

type ChatBotCardProps = {
    chatbot: ApibotsGETResponse[0];
};

export default function ChatBotCard(props: ChatBotCardProps) {
    const swr = useSWRConfig();
    const router = useRouter();
    const { post, error } = useApiPOST<ApiChatsPOSTBody, ApiChatsPOSTResponse>(`/api/chats`);

    const [showEdit, setShowEdit] = useState<boolean>(false);

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
                        chatName: `New chat with ${props.chatbot.name}`,
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
                onClick={() => setShowEdit(true)}
            >
                <FaPen />
            </button>
            <button
                className='bg-red-400 rounded p-1'
                onClick={async () => {
                    const response = await fetch(`/api/bots/${props.chatbot.id}`, {
                        method: 'DELETE',
                    });
                    swr.mutate('/api/bots');
                }}
            >
                <FaTrash />
            </button>
        </div>
        {showEdit && <Modal onClose={() => setShowEdit(false)}>
            <ChatBotEdit
                id={props.chatbot.id}
                onClose={() => setShowEdit(false)}
                onSave={() => setShowEdit(false)}
            />
        </Modal>}
    </div>;
}