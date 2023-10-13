import clsx from 'clsx';
import ChatMarkdown from './ChatMarkdown';
import { useApiGET } from '@/api/fetcher';
import { ApiChatMsgResponseData } from '../../../pages/api/chats/msg/[msg]';

type ChatMessageComponentProps = {
    id: string;
};

export default function ChatMessageComponent(props: ChatMessageComponentProps) {
    const { data, error, reloading } = useApiGET<ApiChatMsgResponseData>(`/api/chats/msg/${props.id}`, {
        refreshInterval(data) {
            if (data === undefined) return 1000;
            if (data?.streaming) return 50;
            return 0;
        },
    });



    return <div
        className={clsx(
            'overflow-hidden',
            'flex flex-row flex-grow group/msg min-h-[4rem] rounded-xl border-2',
        )}
    >
        <div className='px-4 py-2 text-white bg-gray-500'>
            <p>{data?.author ?? ""}</p>
        </div>
        <div className='p-4 pb-2 w-full'>
            <ChatMarkdown
                content={data?.content ?? ""}
                loading={data?.streaming ?? false}
            />
        </div>
    </div>
}