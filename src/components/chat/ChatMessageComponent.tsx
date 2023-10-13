import clsx from 'clsx';
import ChatMarkdown from './ChatMarkdown';
import { useApiGET } from '@/api/fetcher';
import { ApiChatMsgResponseData } from '../../../pages/api/chats/msg/[msg]';


type ChatMessageComponentProps = {
    id: string | null;
    content: string;
    author: string;
    streaming: boolean;
};

export default function ChatMessageComponent(props: ChatMessageComponentProps) {
    if (props.streaming) {
        if (props.id === null) return null;
        return <ChatMessageStreamingComponent id={props.id} />;
    }
    return <div
        className={clsx(
            'overflow-hidden',
            'flex flex-row flex-grow group/msg min-h-[4rem] rounded-xl border-2',
        )}
    >
        <div className='px-4 py-2 text-white bg-gray-500'>
            <p>{props.author}</p>
        </div>
        <div className='p-4 pb-2 w-full'>
            <ChatMarkdown
                content={props.content}
                loading={false}
            />
        </div>
    </div>
}

type ChatMessageStreamingComponentProps = {
    id: string;
};

function ChatMessageStreamingComponent(props: ChatMessageStreamingComponentProps) {
    const { data, error, reloading } = useApiGET<ApiChatMsgResponseData>(`/api/chats/msg/${props.id}`, {
        refreshInterval(data) {
            if (props.id.length === 0) return 0;
            if (data === undefined) return 1;
            if (data?.streaming) return 1;
            return 0;
        },
    });

    return <ChatMessageComponent
        id={null}
        content={(data?.content ?? "") + "..."}
        author={data?.author ?? ""}
        streaming={false}
    />;
}
