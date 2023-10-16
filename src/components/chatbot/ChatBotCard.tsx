import { FaPen, FaStar, FaTrash } from 'react-icons/fa6';
import clsx from 'clsx';
import { ApibotsGETResponse } from '../../../pages/api/bots';
import { useApiDELETE, useApiGET, useApiPOST } from '@/api/fetcher';
import { ApiChatsPOSTBody, ApiChatsPOSTResponse } from '../../../pages/api/chats';
import { useRouter } from 'next/router';
import Modal from '../Modal';
import { ChatBotEdit } from './ChatBotEdit';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useSession } from 'next-auth/react';
import LoadingIcon from '../util/LoadingIcon';
import { ApibotGETResponse } from '../../../pages/api/bots/[bot]';
import { ApiBotPublishDELETEResponse, ApiBotPublishPOSTResponse } from '../../../pages/api/bots/[bot]/publish';
import { ApiBotFavouriteDELETEResponse, ApiBotFavouriteGETResponse, ApiBotFavouritePOSTResponse } from '../../../pages/api/bots/[bot]/favourite';


type ChatBotCardProps = {
    id: string;
    onEdit?: (id: string) => void;
};

export function ChatBotCard(props: ChatBotCardProps) {
    const { data: chatbot, error: chatbotError, reloading: chatbotReloading } = useApiGET<ApibotGETResponse>(`/api/bots/${props.id}`);
    const { data: isFav, error: favError, reloading: favReloading } = useApiGET<ApiBotFavouriteGETResponse>(`/api/bots/${props.id}/favourite`);
    const loading = chatbot === undefined && chatbotReloading;
    if (loading) return <LoadingIcon />;
    if (chatbotError !== null) return <div
        className={clsx(
            'bg-gradient-to-br from-slate-500/80 via-slate-300 to-slate-500/60 rounded p-2 shadow-inner flex flex-col justify-between max-w-xs',
            'relative overflow-hidden',
        )}
    >Error while loading chatbot</div>;
    return <ChatBotCardStatic
        chatbot={chatbot!}
        isFav={isFav?.favourite}
        onEdit={props.onEdit}
    />;
}

type ChatBotCardStaticProps = {
    chatbot: ApibotGETResponse;
    isFav?: boolean;
    onEdit?: (id: string) => void;
};

const tiltRotationFactor = 3;
const tiltTranslationFactor = 2;
const tiltZoomFactor = 1.2;

export default function ChatBotCardStatic(props: ChatBotCardStaticProps) {
    const swr = useSWRConfig();
    const router = useRouter();
    const { post: postChat, error: postChatError } = useApiPOST<ApiChatsPOSTBody, ApiChatsPOSTResponse>(`/api/chats`);

    const { post: publish, error: publishError } = useApiPOST<{}, ApiBotPublishPOSTResponse>(`/api/bots/${props.chatbot.id}/publish`);
    const { del: unpublish, error: unpublishError } = useApiDELETE<{}, ApiBotPublishDELETEResponse>(`/api/bots/${props.chatbot.id}/publish`);

    const { post: favourite, error: favouriteError } = useApiPOST<{}, ApiBotFavouritePOSTResponse>(`/api/bots/${props.chatbot.id}/favourite`);
    const { del: unfavourite, error: unfavouriteError } = useApiDELETE<{}, ApiBotFavouriteDELETEResponse>(`/api/bots/${props.chatbot.id}/favourite`);

    const isPublished = props.chatbot.published !== null;
    const isFavourite = props.isFav ?? null;

    const { data: session } = useSession();
    const loggedIn = session !== null;
    const ownsBot = props.chatbot.author.email !== null && session?.user?.email === props.chatbot.author.email;

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
        }}
        onMouseLeave={() => {
            setDoTilt(false);
            setTiltFactor([0, 0]);
        }}
        onMouseEnter={() => setDoTilt(true)}
        style={{
            transform: doTilt ? `perspective(500px)
                        rotateX(${Math.round(tiltFactor[1] * -tiltRotationFactor)}deg)
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
                    if (!loggedIn) {
                        router.push('/chats');
                        return;
                    }
                    const response = await postChat({
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
            {isPublished && isFavourite !== null && <button
                className={clsx(
                    'bg-slate-500 rounded p-1',
                    ownsBot ? 'block' : 'hidden',
                )}
                onClick={async () => {
                    if (isFavourite) await unfavourite({});
                    else await favourite({});
                }}
            >
                {isFavourite ? <FaStar className='text-yellow-300' /> : <FaStar className='text-gray-400' />}
            </button>}
            <div className='flex-grow' />
            <button
                className={clsx(
                    'bg-slate-500 rounded p-1',
                    ownsBot ? 'block' : 'hidden',
                )}
                onClick={async () => {
                    if (isPublished) await unpublish({});
                    else await publish({});
                }}
            >
                {isPublished ? 'Unpublish' : 'Publish'}
            </button>
            {props.onEdit && <button
                className={clsx(
                    'bg-slate-500 rounded p-1',
                    ownsBot ? 'block' : 'hidden',
                )}
                onClick={() => props.onEdit?.(props.chatbot.id)}
            >
                <FaPen />
            </button>}
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