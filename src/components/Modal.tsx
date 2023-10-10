
type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
};

export default function Modal(props: ModalProps) {
    return <div
        className='absolute w-screen h-screen top-0 left-0 flex flex-col items-center justify-center backdrop-blur-lg'
        onClick={(e) => {
            if (e.target === e.currentTarget) {
                props.onClose();
            }
        }}
    >
        {props.children}
    </div>;
}