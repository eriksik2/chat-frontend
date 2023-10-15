import clsx from "clsx";

type MultiSelectProps = {
    className?: string;
    options: {
        label: string;
        value: string;
    }[];
    value: string[];
    onChange: (value: string[]) => void;
};

export default function MultiSelect(props: MultiSelectProps) {
    return <div className="flex flex-wrap gap-1">
        <div className="flex flex-col gap-[2px]">
            <MultiSelectButton
                value={props.options.every((option) => props.value.includes(option.value))}
                onChange={(value) => {
                    if (value) {
                        props.onChange(props.options.map((option) => option.value));
                    } else {
                        props.onChange([]);
                    }
                }}
            >All</MultiSelectButton>
            <MultiSelectButton
                value={!props.options.some((option) => props.value.includes(option.value))}
                onChange={(value) => {
                    if (value) {
                        props.onChange([]);
                    } else {
                        props.onChange(props.options.map((option) => option.value));
                    }
                }}
            >None</MultiSelectButton>
        </div>
        {props.options.map((option, i) => {
            const selected = props.value.includes(option.value);
            return <MultiSelectButton
                key={i}
                value={selected}
                onChange={(value) => {
                    if (!value) {
                        props.onChange(props.value.filter((v) => v !== option.value));
                    } else {
                        props.onChange([...props.value, option.value]);
                    }
                }}
            >{option.label}</MultiSelectButton>;
        })}

    </div>;
}

type MultiSelectButton = {
    value: boolean;
    onChange: (value: boolean) => void;
    children: React.ReactNode;
};

function MultiSelectButton(props: MultiSelectButton) {
    return <button
        className={clsx(
            props.value
                ? "bg-blue-500"
                : "bg-slate-500 scale-90 text-gray-800",
            "rounded px-2 py-1 min-w-[4rem]",
            "transition-all duration-300 ease-in-out",
        )}
        onClick={() => {
            props.onChange(!props.value);
        }}
    >{props.children}</button>;
}