import clsx from "clsx";
import { FaCircleNotch } from "react-icons/fa6";

type LoadingIconProps = {
    className?: string;
};

export default function LoadingIcon(props: LoadingIconProps) {
    return <FaCircleNotch
        className={clsx(
            'animate-spin',
            props.className,
        )}
    />;
}