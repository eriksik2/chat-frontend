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
  return (
    <div className="flex flex-col gap-1 sm:flex-row">
      <div className="flex flex-row gap-[2px] sm:flex-col">
        <MultiSelectButton
          value={props.options.every((option) =>
            props.value.includes(option.value),
          )}
          onChange={(value) => {
            if (value) {
              props.onChange(props.options.map((option) => option.value));
            } else {
              props.onChange([]);
            }
          }}
        >
          All
        </MultiSelectButton>
        <MultiSelectButton
          value={
            !props.options.some((option) => props.value.includes(option.value))
          }
          onChange={(value) => {
            if (value) {
              props.onChange([]);
            } else {
              props.onChange(props.options.map((option) => option.value));
            }
          }}
        >
          None
        </MultiSelectButton>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row">
        {props.options.map((option, i) => {
          const selected = props.value.includes(option.value);
          return (
            <MultiSelectButton
              key={i}
              value={selected}
              onChange={(value) => {
                if (!value) {
                  props.onChange(props.value.filter((v) => v !== option.value));
                } else {
                  props.onChange([...props.value, option.value]);
                }
              }}
              className=""
            >
              {option.label}
            </MultiSelectButton>
          );
        })}
      </div>
    </div>
  );
}

type MultiSelectButtonProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

function MultiSelectButton(props: MultiSelectButtonProps) {
  return (
    <button
      className={clsx(
        props.value ? "bg-blue-500" : "scale-90 bg-slate-500 text-gray-800",
        "min-w-[4rem] rounded px-2 py-1",
        "transition-all duration-300 ease-in-out",
        props.className,
      )}
      onClick={() => {
        props.onChange(!props.value);
      }}
    >
      {props.children}
    </button>
  );
}
