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
      className="relative flex items-center"
      tabIndex={0}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setOpen(false);
      }}
    >
      <button onClick={() => setOpen(!open)}>{props.children}</button>
      <div
        className={clsx(
          "absolute right-0 top-full z-10 mt-2 w-48 rounded-md border border-gray-300 bg-white py-2 shadow-md",
          "transition-all duration-100",
          open
            ? "translate-y-0 opacity-100 duration-100"
            : "pointer-events-none -translate-y-2 touch-none opacity-0 duration-0",
        )}
      >
        {props.dropdown}
      </div>
    </div>
  );
}
