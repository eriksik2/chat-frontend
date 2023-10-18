type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal(props: ModalProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 top-0 z-30 flex flex-col items-center justify-center backdrop-blur-lg"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          props.onClose();
        }
      }}
    >
      {props.children}
    </div>
  );
}
