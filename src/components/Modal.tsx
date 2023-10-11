
type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
};

export default function Modal(props: ModalProps) {
    return <div
        className='fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center backdrop-blur-lg z-30'
        onClick={(e) => {
            if (e.target === e.currentTarget) {
                props.onClose();
            }
        }}
    >
        {props.children}
    </div>;
}