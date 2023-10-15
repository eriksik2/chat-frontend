import clsx from "clsx";
import { useMemo } from "react";


type TextboxProps = {
    className?: string;
    placeholder?: string;
    maxLength?: number;
    value: string;
    onChange: (value: string) => void;
};

export default function Textbox(props: TextboxProps) {
    const styleOverrides = useMemo(() => ({
        // Tests for "h-..." surrounded by spaces or at the start or end of string
        height: /(?:^| )h-[^ ]+(?:$| )/g.test(props.className ?? ''),
        padding: /(?:^| )p[xytlrbse]?-[^ ]+(?:$| )/g.test(props.className ?? ''),
        bg: /(?:^| )bg-(?:black|white|gradient-[-a-z]+|[a-z]+-[0-9]+)(?:$| )/g.test(props.className ?? ''),
    }), [props.className]);

    return <textarea
        className={clsx(
            'resize-none',
            'rounded shadow-inner',
            !styleOverrides.padding && 'py-1 px-2',
            !styleOverrides.height && 'h-[calc(0.5rem+1lh)]',
            !styleOverrides.bg && 'bg-gradient-to-tr from-gray-100 via-white to-gray-50',
            props.className,
        )}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
    />;
}