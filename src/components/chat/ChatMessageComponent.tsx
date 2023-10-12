import clsx from 'clsx';
import ChatMarkdown from './ChatMarkdown';

type ChatMessageComponentProps = {
    author: string;
    content: string;
    typing: boolean;
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
                loading={props.typing}
            />
        </div>
    </div>
}