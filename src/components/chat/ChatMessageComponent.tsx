import clsx from 'clsx';
import ChatMarkdown from './ChatMarkdown';
import { useApiGET } from '@/api/fetcher';
import { ApiChatMsgResponseData } from '../../../pages/api/chats/msg/[msg]';
import Completion from '@/state/Completion';
import { useEffect, useState } from 'react';


type ChatMessageComponentProps = {
    content: string;
    author: string;
    streaming: boolean;
};

export default function ChatMessageComponent(props: ChatMessageComponentProps) {
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
                loading={props.streaming}
            />
        </div>
    </div>
}

type ChatMessageStreamingComponentProps = {
    onComplete: (message: string) => void;
    completion: Completion;
    author: string;
};

export function ChatMessageStreamingComponent(props: ChatMessageStreamingComponentProps) {
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        props.completion.run(
            (chunk, stop_reason) => {
                console.log(stop_reason);
                setMessage((msg) => msg + chunk);
            },
            (full_message) => {
                props.onComplete(full_message);
            }
        );
    }, [props.completion]);

    return <ChatMessageComponent
        content={message}
        author={props.author}
        streaming={true}
    />;
}
