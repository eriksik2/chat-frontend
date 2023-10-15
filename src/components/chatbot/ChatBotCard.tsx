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
import { useSession } from 'next-auth/react';

type ChatBotCardProps = {
    chatbot: ApibotsGETResponse[0];
    onEdit: (id: string) => void;
};

const tiltRotationFactor = 3;
const tiltTranslationFactor = 2;
const tiltZoomFactor = 1.2;

export default function ChatBotCard(props: ChatBotCardProps) {
    const swr = useSWRConfig();
    const router = useRouter();
    const { post, error } = useApiPOST<ApiChatsPOSTBody, ApiChatsPOSTResponse>(`/api/chats`);

    const { data: session } = useSession();
    const ownsBot = props.chatbot.author.email !== null && session?.user?.email === props.chatbot.author.email;

    const [aspect, setAspect] = useState<number>(0);
    const [doTilt, setDoTilt] = useState<boolean>(false);
    const [tiltFactor, setTiltFactor] = useState<[number, number]>([0, 0]);

    return <div
        className={clsx(
            'bg-gradient-to-br from-slate-500/80 via-slate-300 to-slate-500/60 rounded p-2 shadow-inner flex flex-col justify-between max-w-xs',
            'relative overflow-hidden',
        )}
        onMouseMove={e => {
            const card = e.currentTarget.getBoundingClientRect();
            const x = 2 * (e.clientX - card.x) / card.width - 1;
            const y = 2 * (e.clientY - card.y) / card.height - 1;
            setTiltFactor([x, y]);
            setAspect(card.width / card.height);
        }}
        onMouseLeave={() => {
            setDoTilt(false);
            setTiltFactor([0, 0]);
        }}
        onMouseEnter={() => setDoTilt(true)}
        style={{
            transform: doTilt ? `perspective(500px)
                        rotateX(${Math.round(tiltFactor[1] * -tiltRotationFactor * aspect)}deg)
                        rotateY(${Math.round(tiltFactor[0] * tiltRotationFactor)}deg)
                        translateX(${Math.round(tiltFactor[0] * -tiltTranslationFactor)}px)
                        translateY(${Math.round(tiltFactor[1] * -tiltTranslationFactor)}px)
                        translateZ(${20 * tiltZoomFactor}px)
                        ` : undefined,
            transition: doTilt ? 'transform 0.1s' : 'transform 0.5s',
        }}
    >
        <div className='px-2 pt-1'>
            <div className='flex flex-row items-baseline gap-2'>
                <p className='text-xl flex-auto'>{props.chatbot.name}</p>
                <p className='text-sm flex-initial whitespace-nowrap'>by {props.chatbot.author.name}</p>
            </div>
            <br />
            <p className='max-w-xs'>{props.chatbot.description}</p>
            <br />
        </div>
        <div className='flex flex-row justify-end gap-2 pt-2'>
            <button
                className='bg-blue-500 rounded shadow-inner p-1 text-sm'
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
                className={clsx(
                    'bg-slate-500 rounded p-1',
                    ownsBot ? 'block' : 'hidden',
                )}
                onClick={() => props.onEdit(props.chatbot.id)}
            >
                <FaPen />
            </button>
            <button
                className={clsx(
                    'bg-red-400 rounded p-1',
                    ownsBot ? 'block' : 'hidden',
                )}
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
    </div>;
}