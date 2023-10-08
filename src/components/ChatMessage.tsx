

type ChatMessageProps = {
    role: string;
    content: string;
};

export default function ChatMessage(props: ChatMessageProps) {


    return <div className='flex flex-row gap-2'>
        <div className='px-4 py-2 text-white bg-gray-500'>
            {props.role}
        </div>
        <div>{props.content}</div>
    </div>
}