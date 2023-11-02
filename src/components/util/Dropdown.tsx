import clsx from "clsx";
import { useRef, useState } from "react";

type DropdownProps = {
  dropdown: React.ReactNode;
  children: React.ReactNode;
};

export default function Dropdown(props: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      tabIndex={0}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setOpen(false);
      }}
    >
      <div onClick={() => setOpen(!open)}>{props.children}</div>
      <div
        className={clsx(
          "absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-300 bg-white py-2 shadow-md",
          "transition-opacity duration-100",
          open
            ? "opacity-100 duration-100"
            : "pointer-events-none touch-none opacity-0 duration-0",
        )}
      >
        {props.dropdown}
      </div>
    </div>
  );
}
